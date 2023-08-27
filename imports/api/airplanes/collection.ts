import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'airplanes';

export interface Airplane extends BaseCollection {
  readonly name: string;
  readonly tailNumber: string;
}

export const AirplanesCollection = new Mongo.Collection<Airplane>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(AirplanesCollection);
}
