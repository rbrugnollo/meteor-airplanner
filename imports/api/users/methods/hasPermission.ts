import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Permission, PermissionsByRole, RoleName } from '../collection';

export const hasPermission = createMethod({
  name: 'users.hasPermission',
  schema: z.object({
    permission: z.custom<Permission>(),
  }),
  run({ permission }) {
    const userId = this.userId!;

    // Check if user is disabled
    const user = Meteor.users.findOne(userId);
    if (user?.profile?.disabled) {
      return false;
    }

    // Check if user is admin
    const roles = Roles.getRolesForUser(userId) as unknown as RoleName[];
    if (roles.includes('Admin')) {
      return true;
    }

    // Check if user has permission
    const userPermissions = roles.flatMap((role) => {
      const rolePermissions = PermissionsByRole.find((r) => r.role === role)?.permissions ?? [];
      return rolePermissions;
    });

    return userPermissions.includes(permission);
  },
});
