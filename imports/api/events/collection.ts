import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';
import { Flight } from '../flights/collection';

export const COLLECTION_NAME = 'events';

export interface BaseEvent extends BaseCollection {
  readonly title: string;
  readonly start: Date;
  readonly end: Date;
  readonly type: string;
}

export interface FlightEvent extends BaseEvent {
  readonly type: 'Flight';
  readonly flight: Flight;
}

export type AirplaneEvents = FlightEvent;

// All Events
export type Event = AirplaneEvents;

export const EventsCollection = new Mongo.Collection<Event>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(EventsCollection);
}
