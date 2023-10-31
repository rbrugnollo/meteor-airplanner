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

export const PermissionTypes = [
  'airplanes.list',
  'airplanes.view',
  'airplanes.insert',
  'airplanes.update',
  'airplanes.remove',
  'airports.list',
  'airports.view',
  'airports.insert',
  'airports.update',
  'airports.remove',
  'users.list',
  'users.view',
  'users.insert',
  'users.update',
  'users.remove',
  'costCenters.list',
  'costCenters.view',
  'costCenters.insert',
  'costCenters.update',
  'costCenters.remove',
  'flights.list',
  'flights.view',
  'flights.insert',
  'flights.update',
  'flights.remove',
  'schedule.list',
  'schedule.view',
  'schedule.insert',
  'schedule.update',
  'schedule.remove',
] as const;

export type Permission = (typeof PermissionTypes)[number];

export const PermissionsByRole: { readonly role: RoleName; readonly permissions: Permission[] }[] =
  [
    { role: 'Admin', permissions: PermissionTypes.map((m) => m) },
    { role: 'Captain', permissions: PermissionTypes.map((m) => m) },
    { role: 'First Officer', permissions: PermissionTypes.map((m) => m) },
    { role: 'Secretary', permissions: [] },
    { role: 'Schedule Editor', permissions: [] },
    { role: 'Airplane Manager', permissions: [] },
    { role: 'Flight Requester', permissions: [] },
    { role: 'Flight Authorizer', permissions: [] },
    { role: 'Passenger', permissions: [] },
  ];

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(Meteor.users);
}
