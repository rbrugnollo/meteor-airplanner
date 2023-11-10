import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.emailTemplates.siteName = 'Airplanner';
Accounts.emailTemplates.from = 'Airplanner Admin <rafael@english4life.com.br>';

Accounts.urls.enrollAccount = (token) =>
  Meteor.absoluteUrl('auth/password/enroll-account/' + token);

Accounts.urls.resetPassword = (token) =>
  Meteor.absoluteUrl('auth/password/reset-password/' + token);

Accounts.emailTemplates.enrollAccount.html = (_user, url) => {
  return `Enrollment email URL: ${url}`;
};

Accounts.emailTemplates.resetPassword.html = (_user, url) => {
  return `Reset password URL: ${url}`;
};

Accounts.validateLoginAttempt(
  ({
    allowed,
    error,
    user,
  }: {
    readonly allowed: boolean;
    readonly error?: Meteor.Error;
    readonly user?: Meteor.User;
  }) => {
    if (!allowed && error) {
      throw error;
    } else if (user && user.profile?.disabled) {
      throw new Meteor.Error('Your account is disabled');
    }
    return true;
  },
);
