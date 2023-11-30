import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Meteor } from 'meteor/meteor';

export const subscribeToPush = createMethod({
  name: 'users.subscribeToPush',
  schema: z.object({
    subscription: z.string(),
  }),
  async run({ subscription }) {
    if (!this.userId) return;
    Meteor.users.update(this.userId, {
      $set: { 'profile.subscription': JSON.parse(subscription) },
    });
  },
});
