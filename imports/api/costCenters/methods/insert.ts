import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const insert = createMethod({
  name: 'costCenters.insert',
  schema: z.object({
    name: z.string(),
  }),
  async run(airplane) {
    return CostCentersCollection.insertAsync({
      ...airplane,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
