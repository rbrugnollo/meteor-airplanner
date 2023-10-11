import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const COLLECTION_NAME = 'apiCacheLogs';

export interface ApiCacheLog {
  readonly _id: string;
  readonly key: string;
  readonly result: Promise<unknown>;
  readonly createdAt: Date;
}

export const ApiCacheLogsCollection = new Mongo.Collection<ApiCacheLog>(COLLECTION_NAME);

if (Meteor.isServer) {
  ApiCacheLogsCollection.rawCollection().createIndex({ key: 1 });
}
