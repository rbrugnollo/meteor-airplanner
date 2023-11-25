import { Roles } from 'meteor/alanning:roles';
import { Mongo } from 'meteor/mongo';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import { NotificationId, NotificationType, RoleName } from '/imports/api/users/collection';

declare module 'meteor/meteor' {
  namespace Meteor {
    export interface User {
      _id: string;
      username?: string | undefined;
      emails?: UserEmail[] | undefined;
      createdAt?: Date | undefined;
      profile?: UserProfile;
    }
    export interface UserProfile {
      name: string;
      roles: RoleName[];
      base?: ValueLabelType | null;
      disabled?: boolean;
      notificationCount?: number;
      notifications?: {
        [key in NotificationId]: {
          [key in NotificationType]: boolean;
        };
      };
    }
    const roleAssignment: Mongo.Collection<Roles.Role>;
  }
}
