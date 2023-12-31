import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { removeDefault } from './removeDefault';

export const insert = createMethod({
  name: 'users.insert',
  schema: z.object({
    email: z.string(),
    name: z.string(),
    roles: z.any().array(),
    base: ValueLabelTypeSchema.optional(),
  }),
  async run({ name, email, roles, base }) {
    const userId = await Accounts.createUserAsync({
      username: email,
      email,
      profile: { name, roles, base },
    });

    Roles.setUserRoles(userId, roles);
    Accounts.sendEnrollmentEmail(userId);

    // Remove default user if possible
    await removeDefault();

    return userId;
  },
});
