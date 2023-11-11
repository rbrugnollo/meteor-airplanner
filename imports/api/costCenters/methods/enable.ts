import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const enable = createMethod({
  name: 'costCenters.enable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await CostCentersCollection.updateAsync({ _id }, { $unset: { disabled: true } });
  },
});
