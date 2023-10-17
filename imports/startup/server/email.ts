import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.emailTemplates.siteName = 'Airplanner';
Accounts.emailTemplates.from = 'Airplanner Admin <noreply@airplanner.com>';

Accounts.urls.enrollAccount = function (token) {
  return Meteor.absoluteUrl('auth/password/enroll-account/' + token);
};

Accounts.urls.resetPassword = function (token) {
  return Meteor.absoluteUrl('auth/password/reset-password/' + token);
};
