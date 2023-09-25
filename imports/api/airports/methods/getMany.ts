import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const getMany = createMethod({
  name: 'airports.getMany',
  schema: z.object({
    airportIds: z.array(z.string()),
  }),
  async run({ airportIds }) {
    return AirportsCollection.find({ _id: { $in: airportIds } }).fetchAsync();
  },
});
