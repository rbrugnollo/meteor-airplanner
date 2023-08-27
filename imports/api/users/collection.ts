import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';

export const RoleNames = {
  ADMIN: 'Admin',
  CAPTAIN: 'Captain',
  FIRST_OFFICER: 'First Officer',
  PASSENGER: 'Passenger',
};

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(Meteor.users);
}
