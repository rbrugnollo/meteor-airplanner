import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { NotificationsCollection } from '../../notifications/collection';

export const updateNotificationCount = createMethod({
  name: 'users.updateNotificationCount',
  schema: z.object({
    userIds: z.array(z.string()),
  }),
  async run({ userIds }) {
    for (const userId of userIds) {
      const notifications = await NotificationsCollection.countDocuments({ userId, read: false });
      await Meteor.users.updateAsync(
        { _id: userId },
        {
          $set: {
            'profile.notificationCount': notifications,
          },
        },
      );
    }
  },
});
