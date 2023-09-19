import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Airport, AirportsCollection } from '../collection';

export const list = createPublication({
  name: 'airports.list',
  schema: z.object({
    selector: z.custom<Mongo.Selector<Airport>>(),
    options: z.custom<Mongo.Options<Airport>>(),
  }),
  run({ selector, options }) {
    return AirportsCollection.find(selector, options);
  },
});
