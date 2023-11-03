import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection } from '../collection';

export const getOne = createMethod({
  name: 'events.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return await EventsCollection.findOneAsync(_id);
  },
});
