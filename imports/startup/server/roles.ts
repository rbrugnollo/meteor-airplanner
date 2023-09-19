import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { RoleName, RoleNames } from '/imports/api/users/collection';

export const DefaultAdmin = {
  username: 'admin@admin.com',
  email: 'admin@admin.com',
  password: 'admin123$change',
  profile: {
    name: 'Default Admin',
    roles: ['Admin'] as RoleName[],
  },
};

const CreateRoles = () => {
  let property: keyof typeof RoleNames;

  for (property in RoleNames) {
    Roles.createRole(RoleNames[property], { unlessExists: true });
  }
};

const AddDefaultAdmin = async () => {
  const adminUsers = await Roles.getUsersInRole('Admin').fetchAsync();
  if (adminUsers.length > 1) {
    const defaultAdmin = Accounts.findUserByUsername(DefaultAdmin.username);
    if (defaultAdmin) {
      await Meteor.users.removeAsync(defaultAdmin._id);
    }
  }
  if (!adminUsers.length) {
    const userId = await Accounts.createUserAsync(DefaultAdmin);
    Roles.addUsersToRoles(userId, 'Admin');
  }
};

export const RolesStartup = async () => {
  CreateRoles();
  await AddDefaultAdmin();
};
