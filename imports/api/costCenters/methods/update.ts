import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const update = createMethod({
  name: 'costCenters.update',
  schema: z.object({
    _id: z.string(),
    name: z.string(),
  }),
  async run(costCenter) {
    const { _id, ...data } = costCenter;
    return CostCentersCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );
  },
});
