import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const getOne = createMethod({
  name: 'costCenters.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return CostCentersCollection.findOneAsync(_id);
  },
});
