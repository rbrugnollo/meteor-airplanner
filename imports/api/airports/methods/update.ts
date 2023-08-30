import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const update = createMethod({
  name: 'airports.update',
  schema: z.object({
    _id: z.string(),
    name: z.string(),
    city: z.string(),
    country: z.string(),
    iata: z.string(),
    icao: z.string(),
    lat: z.string(),
    lon: z.string(),
    timezone: z.string(),
  }),
  async run(airport) {
    const { _id, ...data } = airport;
    return AirportsCollection.updateAsync(
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
