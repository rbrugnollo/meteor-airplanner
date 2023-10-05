import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';
import { ValueLabelType } from '../common/ValueLabelType';

export const COLLECTION_NAME = 'airplanes';

export interface AirplanePosition {
  readonly updatedAt: Date;
  readonly isFlying: boolean;
  readonly details?: {
    readonly flightNumber: string;
    readonly barometricAltitude: number | 'ground';
    readonly geometricAltitute?: number;
    readonly groundSpeed: number;
    readonly squawk: string;
    readonly lat: number;
    readonly lon: number;
  } | null;
}

export interface AirplaneInfo {
  name: string;
  manufacturer: string;
  type: string;
  iataCode: string;
  icaoCode: string;
  passengers: string;
  speedKmh: string;
  speedKts: string;
  ceilingMeters: string;
  ceilingFeet: string;
  rangeKm: string;
  rangeNm: string;
  mtowKg: string;
  mtowLbs: string;
  alias: string;
}

export interface Airplane extends BaseCollection {
  readonly name: string;
  readonly tailNumber: string;
  readonly icaoCode?: string | null;
  readonly captain?: ValueLabelType | null;
  readonly firstOfficer?: ValueLabelType | null;
  readonly manager?: ValueLabelType | null;
  readonly pilots?: ValueLabelType[] | null;
  readonly seats: number;
  readonly position?: AirplanePosition | null;
  readonly info?: AirplaneInfo | null;
}

export const AirplanesCollection = new Mongo.Collection<Airplane>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(AirplanesCollection);
}
