import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const insert = createMethod({
  name: 'airplanes.insert',
  schema: z.object({
    name: z.string(),
    tailNumber: z.string(),
  }),
  async run(airplane) {
    return AirplanesCollection.insertAsync(airplane);
  },
});
