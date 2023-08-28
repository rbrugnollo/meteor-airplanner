import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';

export const RoleNames = {
  ADMIN: 'Admin',
  CAPTAIN: 'Captain',
  FIRST_OFFICER: 'First Officer',
  PASSENGER: 'Passenger',
};

export const Pilots = [RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER];

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(Meteor.users);
}
