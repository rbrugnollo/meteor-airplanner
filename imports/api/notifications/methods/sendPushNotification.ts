import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Meteor } from 'meteor/meteor';
import { sendNotification } from 'web-push';

export const sendPushNotification = createMethod({
  name: 'notifications.sendPushNotification',
  schema: z.object({
    userId: z.string(),
    payload: z.any(),
  }),
  async run({ userId, payload }) {
    const subscription = Meteor.users.findOne(userId)?.profile?.subscription;
    if (!subscription) return;
    await sendNotification(subscription, JSON.stringify(payload));
  },
});
