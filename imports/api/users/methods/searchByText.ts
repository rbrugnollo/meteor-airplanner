import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const searchByText = createMethod({
  name: 'users.searchByText',
  schema: z.object({
    roles: z.array(z.string()),
  }),
  run({ roles }) {
    const selector: Mongo.Selector<Meteor.User> = roles.length
      ? {
          'profile.roles': { $in: roles },
        }
      : {};
    return Meteor.users.find(selector, { sort: { 'profile.name': 1 } }).fetch();
  },
});
