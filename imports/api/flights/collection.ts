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
  readonly groupId: string;
  readonly status: 'Draft' | 'Published' | 'Scheduled' | 'Confirmed';
  readonly airplane: ValueLabelType;
  readonly scheduledDepartureDateTime: Date;
  readonly scheduledArrivalDateTime: Date;
  readonly estimatedDuration: string;
  readonly handlingDuration: string;
  readonly origin: ValueLabelType;
  readonly destination: ValueLabelType;
  readonly maintenance: boolean;
  readonly published: boolean;
  readonly dateConfirmed: boolean;
  readonly timeConfirmed: boolean;
  readonly captain?: ValueLabelType | null;
  readonly captainInReserve: boolean;
  readonly firstOfficer?: ValueLabelType | null;
  readonly firstOfficerInReserve: boolean;
  readonly passengers?: ValueLabelType[] | null;
  readonly requesters?: FlightRequester[] | null;
  readonly notes?: string | null;
}

export const FlightsCollection = new Mongo.Collection<Flight>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(FlightsCollection);
}
