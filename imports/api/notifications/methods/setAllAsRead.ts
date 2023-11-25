import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
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
    await setNotificationCountToZero();
  },
});

export const setNotificationCountToZero = createMethod({
  name: 'notifications.setNotificationCountToZero',
  schema: z.undefined(),
  async run() {
    if (!this.userId) return;
    await Meteor.users.updateAsync(
      { _id: this.userId },
      {
        $set: {
          'profile.notificationCount': 0,
        },
      },
    );
  },
});
