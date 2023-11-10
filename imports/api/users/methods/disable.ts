import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const disable = createMethod({
  name: 'users.disable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await Meteor.users.updateAsync({ _id }, { $set: { 'profile.disabled': true } });
  },
});
