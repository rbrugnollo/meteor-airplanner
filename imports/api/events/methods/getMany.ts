import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection } from '../collection';

export const getMany = createMethod({
  name: 'events.getMany',
  schema: z.object({
    from: z.date(),
    to: z.date(),
  }),
  async run({ from, to }) {
    return await EventsCollection.find({
      start: {
        $gte: from,
        $lte: to,
      },
    }).fetchAsync();
  },
});
