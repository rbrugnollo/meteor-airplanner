/* eslint-disable @typescript-eslint/no-explicit-any */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'auditLogs';

export type AuditLog = {
  _id?: string;
  userId?: string;
  collection: string;
  docId: string;
  createdAt: Date;
  action: 'insert' | 'update' | 'remove';
  doc?: BaseCollection;
  fieldNames?: string[];
  modifier?: any;
  options?: any;
};

class AuditLogsCollectionClass extends Mongo.Collection<AuditLog> {
  constructor() {
    super(COLLECTION_NAME);
  }

  addLogger(collection: Mongo.Collection<any>) {
    if (Meteor.isServer) {
      /**
       * Add a log entry when a document is added to a collection.
       */
      const logInsert = (userId: string, doc: BaseCollection, collectionName: string) => {
        this.insert({
          userId,
          collection: collectionName,
          docId: doc._id as string,
          action: 'insert',
          createdAt: new Date(),
          doc,
        });
      };

      /**
       * Add a log entry when a document is removed from a collection.
       */
      const logRemove = (userId: string, doc: BaseCollection, collectionName: string) => {
        this.insert({
          userId,
          collection: collectionName,
          docId: doc._id as string,
          action: 'remove',
          createdAt: new Date(),
        });
      };

      /**
       * Add a log entry when a document is modified.
       */
      const logUpdate = (
        userId: string,
        doc: BaseCollection,
        collectionName: string,
        fieldNames: string[],
        modifier: any,
        options: any,
      ) => {
        this.insert({
          userId,
          collection: collectionName,
          docId: doc._id as string,
          action: 'update',
          createdAt: new Date(),
          doc,
          fieldNames,
          modifier,
          options,
        });
      };

      const collectionName = (collection as any)._name || 'unknown';

      collection.after.insert((userId, doc) => {
        logInsert(userId || '', doc, collectionName);
      });

      collection.after.remove((userId, doc) => {
        logRemove(userId || '', doc, collectionName);
      });

      collection.after.update(function (userId, doc, fieldNames, modifier, options) {
        logUpdate(userId || '', doc, collectionName, fieldNames, modifier, options);
      });
    }
  }
}

export const AuditLogsCollection = new AuditLogsCollectionClass();

if (Meteor.isServer) {
  AuditLogsCollection.rawCollection().createIndex({ userId: 1 });
  AuditLogsCollection.rawCollection().createIndex({ docId: 1 });
  AuditLogsCollection.rawCollection().createIndex({ collection: 1 });
}
