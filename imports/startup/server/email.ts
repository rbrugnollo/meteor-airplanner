import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.emailTemplates.siteName = 'Airplanner';
Accounts.emailTemplates.from = 'Airplanner Admin <rafael@english4life.com.br>';

Accounts.urls.enrollAccount = (token) => 
  Meteor.absoluteUrl('auth/password/enroll-account/' + token);

Accounts.urls.resetPassword = (token) => 
  Meteor.absoluteUrl('auth/password/reset-password/' + token);
