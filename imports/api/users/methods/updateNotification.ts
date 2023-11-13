import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { NotificationId, NotificationType } from '../collection';

export const updateNotification = createMethod({
  name: 'users.updateNotification',
  schema: z.object({
    _id: z.string(),
    notificationId: z.custom<NotificationId>(),
    notificationType: z.custom<NotificationType>(),
    value: z.boolean(),
  }),
  async run({ _id, notificationId, notificationType, value }) {
    const modifier = {
      $set: { [`profile.notifications.${notificationId}.${notificationType}`]: value },
    } as unknown as Mongo.Modifier<Meteor.User>;
    return await Meteor.users.updateAsync({ _id }, modifier);
  },
});
