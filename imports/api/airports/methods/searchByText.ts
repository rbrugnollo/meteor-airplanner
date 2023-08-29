import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const searchByText = createMethod({
  name: 'airports.searchByText',
  schema: z.object({
    q: z.string(),
  }),
  run({ q }) {
    return AirportsCollection.find(
      {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { city: { $regex: q, $options: 'i' } },
          { icao: { $regex: q, $options: 'i' } },
        ],
      },
      { limit: 15, sort: { name: 1 } },
    ).fetch();
  },
});
