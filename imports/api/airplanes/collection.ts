import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';
import { ValueLabelType } from '../common/ValueLabelType';

export const COLLECTION_NAME = 'airplanes';

export interface Airplane extends BaseCollection {
  readonly name: string;
  readonly tailNumber: string;
  readonly captain?: ValueLabelType;
  readonly firstOfficer?: ValueLabelType;
  readonly manager?: ValueLabelType;
  readonly pilots?: ValueLabelType[];
  readonly seats?: number;
}

export const AirplanesCollection = new Mongo.Collection<Airplane>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(AirplanesCollection);
}
