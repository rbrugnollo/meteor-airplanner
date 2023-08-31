import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { AuditLogsCollection } from '../auditLogs/collection';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'costCenters';

export interface CostCenter extends BaseCollection {
  readonly name: string;
}

export const CostCentersCollection = new Mongo.Collection<CostCenter>(COLLECTION_NAME);

if (Meteor.isServer) {
  AuditLogsCollection.addLogger(CostCentersCollection);
}
