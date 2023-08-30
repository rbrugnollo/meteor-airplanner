import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const insert = createMethod({
  name: 'airports.insert',
  schema: z.object({
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
    return AirportsCollection.insertAsync({
      ...airport,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
