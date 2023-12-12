import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { NotificationsCollection } from '../collection';
import { toggleRead } from './toggleRead';

export const getOne = createMethod({
  name: 'notifications.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await toggleRead({ _id });
    return NotificationsCollection.findOneAsync(_id);
  },
});
