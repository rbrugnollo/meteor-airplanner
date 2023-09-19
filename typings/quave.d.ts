declare module 'meteor/quave:logged-user-react' {
  import { Meteor } from 'meteor/meteor';
  export const useLoggedUser: () => {
    loggedUser: Meteor.User | null;
    isLoadingLoggedUser: boolean;
  };
}
