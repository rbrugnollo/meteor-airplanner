import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { updateNotificationCount } from '../../users/methods/updateNotificationCount';
import { NotificationsCollection } from '../collection';

export const setAllAsRead = createMethod({
  name: 'notifications.setAllAsRead',
  schema: z.undefined(),
  async run() {
    if (!this.userId) return;

    await NotificationsCollection.updateAsync(
      { userId: this.userId },
      { $set: { read: true } },
      { multi: true },
    );
    // Update dependent collections
    await updateNotificationCount({ userIds: [this.userId] });
  },
});
