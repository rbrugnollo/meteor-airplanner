import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection } from '../collection';

export const remove = createMethod({
  name: 'events.remove',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return await EventsCollection.removeAsync(_id);
  },
});
