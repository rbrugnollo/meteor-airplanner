import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { RoleNames } from '../collection';
import { DefaultAdmin } from '/imports/startup/server/roles';

export const removeDefault = createMethod({
  name: 'users.removeDefault',
  schema: z.undefined(),
  async run() {
    const adminsCount = await Meteor.users
      .find({
        'profile.roles': { $in: [RoleNames.ADMIN] },
        username: { $ne: DefaultAdmin.username },
      })
      .countAsync();
    if (adminsCount > 0) {
      Meteor.users.removeAsync({ username: DefaultAdmin.username });
    }
  },
});
