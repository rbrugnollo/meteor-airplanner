import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const enable = createMethod({
  name: 'users.enable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await Meteor.users.updateAsync({ _id }, { $unset: { 'profile.disabled': true } });
  },
});
