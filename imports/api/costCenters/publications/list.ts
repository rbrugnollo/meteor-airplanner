import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { CostCentersCollection } from '../collection';

export const list = createPublication({
  name: 'costCenters.list',
  schema: z.undefined(),
  run() {
    return CostCentersCollection.find();
  },
});
