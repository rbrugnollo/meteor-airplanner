import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../collection';

export const list = createPublication({
  name: 'flights.list',
  schema: z.undefined(),
  run() {
    return FlightsCollection.find();
  },
});
