import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const searchByText = createMethod({
  name: 'users.searchByText',
  schema: z.object({
    roles: z.array(z.string()),
  }),
  run({ roles }) {
    return Meteor.users
      .find({ 'profile.roles': { $in: roles } }, { sort: { 'profile.name': 1 } })
      .fetch();
  },
});
