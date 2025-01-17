import { auto } from 'async';
import { homedir } from 'os';
import { join } from 'path';
import fs from 'fs';

const home = '.bosgui';
const credentials = 'credentials.json';
const { isArray } = Array;
const { parse } = JSON;
const stringify = (obj: any) => JSON.stringify(obj, null, 2);

/** Get saved credentials for node

  {
    node: <Node Name String>
  }

  @returns via cbk or Promise
  {
    [credentials]: {
      [cert]: <Base64 or Hex Serialized LND TLS Cert>
      [macaroon]: <Base64 or Hex Serialized Macaroon String>
      socket: <Host:Port Network Address String>
    }
    node: <Node Name String>
  }
*/

type Tasks = {
  validate: () => void;
  getFile: {
    cert_path?: string;
    macaroon_path?: string;
    cert: string;
    macaroon: string;
    socket: string;
  };
  getCert: {
    cert_path: string;
    cert: string;
  };
  getMacaroon: {
    macaroon_path: string;
    macaroon: string;
  };
  credentials: {
    node: string;
    credentials: {
      cert: string;
      macaroon: string;
      socket: string;
    };
  };
};

const getSavedCredentials = async ({ node }) => {
  try {
    const result = await auto<Tasks>({
      // Check arguments
      validate: (cbk: any) => {
        if (!node) {
          return cbk([400, 'ExpectedNodeNameToGetSavedCredentials']);
        }

        if (!!isArray(node)) {
          return cbk([400, 'ExpectedSingleSavedNodeNameToGetCredentialsFor']);
        }

        return cbk();
      },

      // Get the credentials file
      getFile: [
        'validate',
        ({}, cbk: any) => {
          const path = join(...[homedir(), home, node, credentials]);

          return fs.readFile(path, (err, res) => {
            // Exit early on errors, there is no credential found
            if (!!err || !res) {
              return cbk(null, { node });
            }

            try {
              parse(res.toString());
            } catch (err) {
              return cbk([400, 'SavedNodeHasInvalidCredentials']);
            }

            const credentials = parse(res.toString());

            return cbk(null, credentials);
          });
        },
      ],

      // Get cert from path if necessary
      getCert: [
        'getFile',
        ({ getFile }, cbk: any) => {
          if (!getFile.cert_path) {
            return cbk(null, getFile.cert);
          }

          return fs.readFile(getFile.cert_path, (err, res) => {
            if (!!err) {
              return cbk([400, 'SavedNodeCertFileNotFoundAtCertPath', { err }]);
            }

            return cbk(null, res.toString('base64'));
          });
        },
      ],

      // Get macaroon from path if necessary
      getMacaroon: [
        'getFile',
        ({ getFile }, cbk: any) => {
          if (!getFile.macaroon_path) {
            return cbk(null, getFile.macaroon);
          }

          return fs.readFile(getFile.macaroon_path, (err, res) => {
            if (!!err) {
              return cbk([400, 'SavedNodeMacaroonNotFoundAtPath', { err }]);
            }

            return cbk(null, res.toString('base64'));
          });
        },
      ],

      // Final credentials
      credentials: [
        'getCert',
        'getFile',
        'getMacaroon',
        ({ getCert, getFile, getMacaroon }, cbk: any) => {
          if (!getFile.socket) {
            return cbk([400, 'SavedNodeMissingSocket']);
          }

          return cbk(null, {
            node,
            credentials: {
              cert: getCert || undefined,
              macaroon: getMacaroon,
              socket: getFile.socket,
            },
          });
        },
      ],
    });
    return {
      cert: result.credentials.credentials.cert,
      macaroon: result.credentials.credentials.macaroon,
      socket: result.credentials.credentials.socket,
    };
  } catch (error) {
    return { error: stringify(error) };
  }
};

export default getSavedCredentials;
