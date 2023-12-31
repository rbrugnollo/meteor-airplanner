import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';

// Roles
export const RoleNames = {
  ADMIN: 'Admin',
  CAPTAIN: 'Comandante',
  FIRST_OFFICER: 'Co-Piloto',
  SECRETARY: 'Secretário',
  AIRPLANE_MANAGER: 'Responsável Aeronave',
  FLIGHT_REQUESTER: 'Solicitante',
  PASSENGER: 'Passageiro',
};

export const Pilots = [RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER];

export type RoleName =
  | 'Admin'
  | 'Comandante'
  | 'Co-Piloto'
  | 'Secretário'
  | 'Responsável Aeronave'
  | 'Solicitante'
  | 'Passageiro';

// Permissions
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
  'flights.cancel',
  'flights.review',
  'schedule.list',
  'schedule.view',
  'notification.list',
  'notification.view',
  'schedule.insert',
  'schedule.update',
  'schedule.remove',
  'settings',
] as const;

export type Permission = (typeof PermissionTypes)[number];

export const PermissionsByRole: { readonly role: RoleName; readonly permissions: Permission[] }[] =
  [
    { role: 'Admin', permissions: PermissionTypes.map((m) => m) },
    { role: 'Comandante', permissions: PermissionTypes.map((m) => m) },
    { role: 'Co-Piloto', permissions: PermissionTypes.map((m) => m) },
    { role: 'Secretário', permissions: ['notification.list', 'notification.view'] },
    { role: 'Responsável Aeronave', permissions: ['notification.list', 'notification.view'] },
    { role: 'Solicitante', permissions: ['notification.list', 'notification.view'] },
    { role: 'Passageiro', permissions: ['notification.list', 'notification.view'] },
  ];

// Notifications
export const NotificationIds = [
  'flight-created',
  'flight-updated',
  'flight-cancelled',
  'flight-authorize',
] as const;
export type NotificationId = (typeof NotificationIds)[number];
export const NotificationLabels: { id: NotificationId; label: string }[] = [
  {
    id: 'flight-created',
    label: 'Vôo criado',
  },
  {
    id: 'flight-updated',
    label: 'Vôo atualizado',
  },
  {
    id: 'flight-cancelled',
    label: 'Vôo cancelado',
  },
  {
    id: 'flight-authorize',
    label: 'Vôo autorizado',
  },
];

export const NotificationTypes = ['email', 'push'] as const;
export type NotificationType = (typeof NotificationTypes)[number];

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(Meteor.users);
}
