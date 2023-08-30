import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const list = createPublication({
  name: 'airports.list',
  schema: z.undefined(),
  run() {
    return AirportsCollection.find({ country: 'Brazil' }, { limit: 100, sort: { name: 1 } });
  },
});
