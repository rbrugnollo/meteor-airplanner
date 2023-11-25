import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { NotificationsCollection } from '../collection';

export const setAllAsRead = createMethod({
  name: 'notifications.setAllAsRead',
  schema: z.undefined(),
  async run() {
    if (this.userId)
      await NotificationsCollection.updateAsync(
        { userId: this.userId },
        { $set: { read: true } },
        { multi: true },
      );
  },
});
