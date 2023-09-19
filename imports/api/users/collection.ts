import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';

export const RoleNames = {
  ADMIN: 'Admin',
  CAPTAIN: 'Captain',
  FIRST_OFFICER: 'First Officer',
  SECRETARY: 'Secretary',
  SCHEDULE_EDITOR: 'Schedule Editor',
  AIRPLANE_MANAGER: 'Airplane Manager',
  FLIGHT_REQUESTER: 'Flight Requester',
  FLIGHT_AUTHORIZER: 'Flight Authorizer',
  PASSENGER: 'Passenger',
};

export const Pilots = [RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER];

export type RoleName =
  | 'Admin'
  | 'Captain'
  | 'First Officer'
  | 'Secretary'
  | 'Schedule Editor'
  | 'Airplane Manager'
  | 'Flight Requester'
  | 'Flight Authorizer'
  | 'Passenger';

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(Meteor.users);
}
