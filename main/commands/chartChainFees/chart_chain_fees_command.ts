import { getChainFeesChart } from 'balanceofsatoshis/routing';
import request from 'balanceofsatoshis/commands/simple_request';
import { AuthenticatedLnd } from 'lightning';
import * as types from '../../../renderer/types';

const stringify = (data: any) => JSON.stringify(data);

/** Get Blockchain fees paid

  {
    days: <Chain Fees Paid Over Days Count Number>
    is_monochrome: <Omit Colors Bool>
    lnds: [<Authenticated LND API Object>]
    request: <Request Function>
  }

  @returns via Promise
  {
    data: [<Chain Fee Tokens Number>]
    description: <Chart Description String>
    title: <Chart Title String>
  }
*/

const chartChainFeesCommand = async (args: types.commandChartChainFees, lnd: AuthenticatedLnd[]) => {
  try {
    const result = await getChainFeesChart({
      request,
      lnds: lnd,
      days: args.days,
    });

    return { result };
  } catch (error) {
    return { error: stringify(error) };
  }
};

export default chartChainFeesCommand;
