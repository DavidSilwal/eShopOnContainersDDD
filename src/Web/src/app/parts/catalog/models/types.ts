import { types, getEnv, flow } from 'mobx-state-tree';
import * as validate from 'validate.js';
import uuid from 'uuid/v4';
import Debug from 'debug';

import rules from '../validation';
import { models } from '../../../utils';
import { FieldDefinition } from '../../../components/models';

import { DTOs } from '../../../utils/eShop.dtos';
import { ApiClientType } from '../../../stores';

import { TypeType, TypeModel } from '../../../models/catalog/types';

export { TypeType, TypeModel };

const debug = new Debug('catalog types');

export interface TypeListType {
  entries: Map<string, TypeType>;
  loading: boolean;
  list: (term?: string, id?: string) => Promise<{}>;
  add: (type: TypeType) => void;
  remove: (id: string) => Promise<{}>;
}
export const TypeListModel = types
  .model('Catalog_Type_List', {
    entries: types.optional(types.map(TypeModel), {}),
    loading: types.optional(types.boolean, true)
  })
  .actions(self => {
    const list = flow(function*(term?: string, id?: string) {
      const request = new DTOs.ListCatalogTypes();

      request.term = term;
      request.id = id;

      self.loading = true;
      try {
        const client = getEnv(self).api as ApiClientType;
        const results: DTOs.PagedResponse<DTOs.CatalogType> = yield client.paged(request);

        results.records.forEach(record => {
          self.entries.put(record);
        });
        self.loading = false;
      } catch (error) {
        debug('received http error: ', error);
      }

    });
    const add = (type: TypeType) => {
        self.entries.put(type);
    };
    const remove = flow(function*(id: string) {
      const request = new DTOs.RemoveCatalogType();

      request.typeId = id;

      try {
        const client = getEnv(self).api as ApiClientType;
        const result: DTOs.CommandResponse = yield client.command(request);

        self.entries.delete(id);
      } catch (error) {
        debug('received http error: ', error);
      }
    });

    return { list, add, remove };
  });

export interface TypesType {
  List: TypeListType;
}
export const TypesModel = types.model(
  'Catalog_Types',
  {
    List: types.optional(TypeListModel, {})
  }
);
