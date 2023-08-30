import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const getOne = createMethod({
  name: 'airports.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return AirportsCollection.findOneAsync(_id);
  },
});
