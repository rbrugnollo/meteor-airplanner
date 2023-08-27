import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { removeDefault } from './removeDefault';

export const update = createMethod({
  name: 'users.update',
  schema: z.object({
    _id: z.string(),
    email: z.string(),
    name: z.string(),
    roles: z.string().array(),
  }),
  async run({ _id, name, email, roles }) {
    // const currentEmail = await Meteor.users.findOneAsync({ _id });
    const userProps = {
      username: email,
      profile: {
        name,
        roles,
      },
      'emails.0.address': email,
    };
    await Meteor.users.updateAsync({ _id }, { $set: userProps });
    Roles.setUserRoles(_id, roles);

    // Remove default user if possible
    await removeDefault();
  },
});
