import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Flight, FlightsCollection } from '../collection';

export const list = createPublication({
  name: 'flights.list',
  schema: z.object({
    selector: z.custom<Mongo.Selector<Flight>>(),
    options: z.custom<Mongo.Options<Flight>>(),
  }),
  run({ selector, options }) {
    return FlightsCollection.find(selector, options);
  },
});
