import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';

export const searchByText = createMethod({
  name: 'users.searchByText',
  schema: z.object({
    roles: z.array(z.string()),
    userIds: z.array(z.string()).optional(),
  }),
  run({ roles, userIds }) {
    let selector: Mongo.Selector<Meteor.User> = {
      'profile.roles': { $in: roles },
    };
    if (userIds?.length)
      selector = {
        ...selector,
        _id: { $in: userIds },
      };

    return Meteor.users.find(selector, { sort: { 'profile.name': 1 } }).fetch();
  },
});
