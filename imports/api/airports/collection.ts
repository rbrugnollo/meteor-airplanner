import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'airports';

export interface Airport extends BaseCollection {
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly iata: string;
  readonly icao: string;
  readonly lat: string;
  readonly lon: string;
  readonly timezone: string;
}

export const AirportsCollection = new Mongo.Collection<Airport>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(AirportsCollection);
  AirportsCollection.rawCollection().createIndex({ name: 1 });
  AirportsCollection.rawCollection().createIndex({ city: 1 });
  AirportsCollection.rawCollection().createIndex({ icao: 1 });
  AirportsCollection.rawCollection().createIndex({ name: 'text', city: 'text', icao: 'text' });
}
