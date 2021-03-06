import Debug from 'debug';
import { flow, getEnv, types } from 'mobx-state-tree';
import { StoreType } from '../../../stores';
import { DTOs } from '../../../utils/eShop.dtos';

const debug = new Debug('configuration setup');

export interface SetupType {
  loading: boolean;
  seed: () => Promise<{}>;
}
export const SetupModel = types
  .model({
    loading: types.optional(types.boolean, false)
  })
  .actions(self => {

    const seed = flow(function*() {
      const request = new DTOs.Seed();

      try {
        self.loading = true;
        const client = getEnv(self).store as StoreType;

        const waiter = new Promise((resolve) => setTimeout(resolve, 30000));

        // take at least 10 seconds for read models to populate
        yield Promise.all([waiter, client.api.command(request)]);

        client.status.setup();
        setTimeout(() => client.history.push('/'), 1);
      } catch (error) {
        debug('received http error: ', error);
      }
      self.loading = false;
    });
    return { seed };
  });
