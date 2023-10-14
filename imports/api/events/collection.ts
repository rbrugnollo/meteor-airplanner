import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';
import { Flight } from '../flights/collection';
import { ValueLabelType } from '../common/ValueLabelType';

export const COLLECTION_NAME = 'events';

export interface BaseEvent extends BaseCollection {
  readonly title: string;
  readonly start: Date;
  readonly end: Date;
  readonly type: string;
}

// Flight Events
export interface FlightEvent extends BaseEvent {
  readonly type: 'Flight';
  readonly flight: Flight;
}

// Pilot Events
export interface PilotEvent extends BaseEvent {
  readonly pilot: ValueLabelType;
}

export interface PilotInReserveEvent extends PilotEvent {
  readonly type: 'In Reserve';
  readonly flightId: string;
}

export interface PilotVacationEvent extends PilotEvent {
  readonly type: 'Vacation';
}

export type PilotEvents = PilotInReserveEvent | PilotVacationEvent;

// All Events
export type Event = FlightEvent | PilotEvents;

export const EventsCollection = new Mongo.Collection<Event>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(EventsCollection);
}
