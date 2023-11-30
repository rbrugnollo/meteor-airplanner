import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Meteor } from 'meteor/meteor';
import { sendNotification } from 'web-push';

export const sendPushNotification = createMethod({
  name: 'notifications.sendPushNotification',
  schema: z.object({
    userId: z.string(),
  }),
  async run({ userId }) {
    const subscription = Meteor.users.findOne(userId)?.profile?.subscription;
    if (!subscription) return;
    await sendNotification(subscription, JSON.stringify({ title: 'Hello', body: 'World' }));
  },
});
