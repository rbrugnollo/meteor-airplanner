import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const decrementNotificationCount = createMethod({
  name: 'users.decrementNotificationCount',
  schema: z.object({
    userIds: z.array(z.string()),
  }),
  async run({ userIds }) {
    await Meteor.users.updateAsync(
      { _id: { $in: userIds } },
      {
        $inc: {
          'profile.notificationCount': -1,
        },
      },
      { multi: true },
    );
  },
});
