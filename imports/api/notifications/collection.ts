import { Mongo } from 'meteor/mongo';
import { BaseCollection } from '../common/BaseCollection';

export const COLLECTION_NAME = 'notifications';

export interface Notification extends BaseCollection {
  readonly type: 'flight-created' | 'flight-updated' | 'flight-canceled' | 'flight-authorize';
  readonly flightId?: string;
  readonly title: string;
  readonly message: string;
  readonly userId: string;
  readonly read: boolean;
  readonly archived: boolean;
}

export const NotificationsCollection = new Mongo.Collection<Notification>(COLLECTION_NAME);
