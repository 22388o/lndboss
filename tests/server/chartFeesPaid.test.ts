import { expect, test } from '@playwright/test';
import spawnCluster from '../utils/spawn_lightning_cluster.js';
import { chartFeesPaidCommand } from '../../main/commands';
import { readFile } from 'fs';

try {
  test.describe('Test ChartFeesEarned command on the node.js side', async () => {
    let lightning: any[];

    test.beforeAll(async () => {
      lightning = await spawnCluster(2);
    });

    test('run ChartFeesEarned command', async () => {
      const args = {
        days: 10,
        fs: { getFile: readFile },
        in: '021b0ea06c90e7e4ea85daff1a83f7a1b97646da652829178ad1bd5f309af632eb',
        is_most_fees_table: false,
        is_most_forwarded_table: false,
        is_network: false,
        is_peer: false,
        is_rebalances_only: false,
        nodes: [],
        out: undefined,
      };

      const lnds = lightning.map(({ lnd }) => lnd);
      const { error, result } = await chartFeesPaidCommand(args, lnds);

      console.log('ChartFeesPaid----', result);
      expect(error).toBe(undefined);
      expect(result).toBeTruthy();
      expect(result.rows).toBe(undefined);
    });

    test('run ChartFeesPaid command with is_most_fees_table and is_most_forwarded_table', async () => {
      const args = {
        days: 10,
        fs: { getFile: readFile },
        in: '021b0ea06c90e7e4ea85daff1a83f7a1b97646da652829178ad1bd5f309af632eb',
        is_most_fees_table: true,
        is_most_forwarded_table: true,
        is_network: false,
        is_peer: false,
        is_rebalances_only: false,
        nodes: [],
        out: undefined,
      };

      const lnds = lightning.map(({ lnd }) => lnd);
      const { error, result } = await chartFeesPaidCommand(args, lnds);

      console.log('ChartFeesPaid----', result);
      expect(error).toBe(undefined);
      expect(result).toBeTruthy();
      expect(result.rows).toBeTruthy();
      expect(result.rows.length).toBeGreaterThan(0);
    });

    test.afterAll(async () => {
      await Promise.all(lightning.map(({ kill }) => kill({})));
    });
  });
} catch (error) {
  throw error;
}
