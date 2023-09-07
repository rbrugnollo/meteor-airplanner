import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';
import { ValueLabelType } from '../common/ValueLabelType';

export const COLLECTION_NAME = 'flights';

export interface FlightRequester {
  readonly requester?: ValueLabelType;
  readonly costCenter?: ValueLabelType;
  readonly percentage?: number;
}

export interface Flight extends BaseCollection {
  readonly airplane: ValueLabelType;
  readonly scheduledDateTime: Date;
  readonly estimatedDuration: string;
  readonly origin: ValueLabelType;
  readonly destination: ValueLabelType;
  readonly captain?: ValueLabelType;
  readonly firstOfficer?: ValueLabelType;
  readonly passengers?: ValueLabelType[];
  readonly requesters?: FlightRequester[];
  readonly notes?: string;
}

export const FlightsCollection = new Mongo.Collection<Flight>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(FlightsCollection);
}
