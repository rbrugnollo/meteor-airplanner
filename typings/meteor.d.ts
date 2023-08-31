declare module 'meteor/meteor' {
  import { Roles } from 'meteor/alanning:roles';
  import { Mongo } from 'meteor/mongo';
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
      roles: string[];
    }
    const roleAssignment: Mongo.Collection<Roles.Role>;
  }
}

declare module 'meteor/quave:logged-user-react' {
  import { Meteor } from 'meteor/meteor';
  export const useLoggedUser: () => {
    loggedUser: Meteor.User | null;
    isLoadingLoggedUser: boolean;
  };
}
