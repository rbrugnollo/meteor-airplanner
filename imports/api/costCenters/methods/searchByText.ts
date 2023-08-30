import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const searchByText = createMethod({
  name: 'costCenters.searchByText',
  schema: z.undefined(),
  run() {
    return CostCentersCollection.find({}, { sort: { name: 1 } }).fetch();
  },
});
