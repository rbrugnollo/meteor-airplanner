import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const setNotificationCountToZero = createMethod({
  name: 'users.setNotificationCountToZero',
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
