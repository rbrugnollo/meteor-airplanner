import { Roles } from 'meteor/alanning:roles';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Permission, PermissionsByRole, RoleName } from '../collection';

export const hasPermission = createMethod({
  name: 'users.hasPermission',
  schema: z.object({
    permission: z.custom<Permission>(),
  }),
  async run({ permission }) {
    const userId = this.userId!;

    const roles = Roles.getRolesForUser(userId) as unknown as RoleName[];

    if (roles.includes('Admin')) {
      return true;
    }

    const userPermissions = roles.flatMap((role) => {
      const rolePermissions = PermissionsByRole.find((r) => r.role === role)?.permissions ?? [];
      return rolePermissions;
    });

    return userPermissions.includes(permission);
  },
});
