import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { CostCenter, CostCentersCollection } from '../collection';

export const insert = createMethod({
  name: 'costCenters.insert',
  schema: z.custom<Omit<CostCenter, BaseCollectionTypes>>(),
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
