import { Mongo } from 'meteor/mongo';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'notifications';

export interface Notification extends BaseCollection {
  readonly title: string;
  readonly message: string;
  readonly userId: string;
  readonly read: boolean;
  readonly archived: boolean;
}

export const NotificationsCollection = new Mongo.Collection<Notification>(COLLECTION_NAME);
