import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Notification, NotificationsCollection } from '../collection';

export const list = createPublication({
  name: 'notifications.list',
  schema: z.object({
    options: z.custom<Mongo.Options<Notification>>(),
  }),
  run({ options }) {
    if (this.userId) {
      return NotificationsCollection.find({ userId: this.userId }, options);
    } else {
      this.ready();
    }
  },
});
