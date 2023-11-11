import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const disable = createMethod({
  name: 'costCenters.disable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await CostCentersCollection.updateAsync({ _id }, { $set: { disabled: true } });
  },
});
