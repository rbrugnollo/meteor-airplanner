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
  readonly estimatedHandlingDuration: string;
  readonly origin: ValueLabelType;
  readonly destination: ValueLabelType;
  readonly maintenance: boolean;
  readonly published: boolean;
  readonly dateConfirmed: boolean;
  readonly timeConfirmed: boolean;
  readonly authorized: boolean;
  readonly cancelled: boolean;
  readonly captain?: ValueLabelType | null;
  readonly captainInReserve: boolean;
  readonly firstOfficer?: ValueLabelType | null;
  readonly firstOfficerInReserve: boolean;
  readonly passengers?: ValueLabelType[] | null;
  readonly requesters?: FlightRequester[] | null;
  readonly authorizer?: ValueLabelType | null;
  readonly notes?: string | null;
  // review
  readonly departureDateTime?: Date;
  readonly arrivalDateTime?: Date;
  readonly duration?: string;
  readonly handlingDuration?: string;
  readonly expensenses?: {
    readonly fuel?: {
      readonly pounds: number;
      readonly liters: number;
      readonly unitPrice: number;
      readonly subTotal: number;
    };
    readonly hangar?: {
      readonly stopover?: number;
      readonly ramp?: number;
      readonly price?: number;
      readonly subTotal: number;
    };
    readonly maintenance?: {
      readonly maintenancePrice: number;
      readonly duration: number;
      readonly dolarPrice: number;
      readonly subTotal: number;
    };
    readonly crew?: {
      readonly flightAttendant?: number;
      readonly security?: number;
      readonly transportation?: number;
      readonly hotel?: number;
      readonly food?: number;
      readonly subTotal: number;
    };
    readonly landings?: number;
    readonly landingsPrice?: number;
    readonly decea?: number;
    readonly other?: number;
    readonly grandTotal: number;
  };

  // not normalized
  readonly createdByName: string;
  readonly updatedByName: string;
}

export const FlightsCollection = new Mongo.Collection<Flight>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(FlightsCollection);
}
