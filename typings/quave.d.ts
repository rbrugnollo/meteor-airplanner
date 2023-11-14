declare module 'meteor/quave:logged-user-react' {
  import { Meteor } from 'meteor/meteor';
  export const useLoggedUser: () => {
    loggedUser: Meteor.User | null;
    isLoadingLoggedUser: boolean;
  };
}

declare module 'meteor/quave:email-postmark' {
  export const sendEmail: (options: {
    to: string;
    subject: string;
    content: string;
  }) => Promise<void>;
}
