import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { updateNotificationCount } from '../../users/methods/updateNotificationCount';
import { NotificationsCollection } from '../collection';

export const toggleRead = createMethod({
  name: 'notifications.toggleRead',
  schema: z.object({
    _id: z.string(),
    read: z.boolean().optional(),
  }),
  async run({ _id, read = true }) {
    if (!this.userId) return;

    const result = await NotificationsCollection.updateAsync(
      { _id, userId: this.userId },
      { $set: { read } },
    );

    if (result > 0) {
      // Update dependent collections
      await updateNotificationCount({ userIds: [this.userId] });
    }
  },
});
