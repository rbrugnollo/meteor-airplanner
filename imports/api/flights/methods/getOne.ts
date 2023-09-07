import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../collection';

export const getOne = createMethod({
  name: 'flights.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return FlightsCollection.findOneAsync(_id);
  },
});
