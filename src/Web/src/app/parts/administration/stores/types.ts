import Debug from 'debug';
import { flow, getEnv, types } from 'mobx-state-tree';
import uuid from 'uuid/v4';
import * as validate from 'validate.js';
import { FieldDefinition } from '../../../components/models';
import { ApiClientType } from '../../../stores';
import { DTOs } from '../../../utils/eShop.dtos';
import rules from '../validation';

const debug = new Debug('catalog types');

export interface TypeFormType {
  id: string;
  type: string;
  readonly form: { [idx: string]: FieldDefinition };
  submit: () => Promise<{}>;
}
export const TypeFormModel = types
  .model({
    id: types.optional(types.identifier(types.string), uuid),
    type: types.maybe(types.string)
  })
  .views(self => ({
    get validation() {
      const validation = {
        type: rules.type
      };

      return validate(self, validation);
    }
  }))
  .views(self => ({
    get form(): {[idx: string]: FieldDefinition} {
      return ({
        type: {
          input: 'text',
          label: 'Type',
          required: true,
        }
      });
    }
  }))
  .actions(self => {
    const submit = flow(function*() {
      const request = new DTOs.AddCatalogType();

      request.typeId = self.id;
      request.type = self.type;

      try {
        const client = getEnv(self).api as ApiClientType;
        const result: DTOs.CommandResponse = yield client.command(request);

      } catch (error) {
        debug('received http error: ', error);
        throw error;
      }
    });

    return { submit };
  });
