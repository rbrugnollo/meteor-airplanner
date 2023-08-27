import { Meteor } from 'meteor/meteor';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';

export const selectByRoles = createPublication({
  name: 'users.selectByRoles',
  schema: z.object({
    roles: z.string().array(),
  }),
  run({ roles }) {
    return Meteor.users.find({ 'profile.roles': { $in: roles } }, {});
  },
});
