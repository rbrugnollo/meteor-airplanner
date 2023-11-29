import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { decrementNotificationCount } from '../../users/methods/decrementNotificationCount';
import { NotificationsCollection } from '../collection';

export const setAsRead = createMethod({
  name: 'notifications.setAsRead',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    if (!this.userId) return;

    const result = await NotificationsCollection.updateAsync(
      { _id, userId: this.userId, read: false },
      { $set: { read: true } },
    );

    if (result > 0) {
      // Update dependent collections
      await decrementNotificationCount({ userIds: [this.userId] });
    }
  },
});
