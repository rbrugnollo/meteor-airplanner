import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import dayjs from 'dayjs';
import { updateNotificationCount } from '../../users/methods/updateNotificationCount';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';
import { sendPushNotification } from './sendPushNotification';

export const flightUpdated = createMethod({
  name: 'notifications.flightUpdated',
  schema: z.object({
    flightId: z.string(),
    difference: z.object({}),
  }),
  async run({ flightId, difference }) {
    const flight = await FlightsCollection.findOneAsync(flightId);

    const users = await Meteor.users.find().fetchAsync();
    const userIds = users
      .filter((f) => f.profile?.notifications?.['flight-updated']?.push)
      .map((m) => m._id)
      .filter((m) => m && m !== this.userId);

    const title = `Vôo Atualizado: ${flight?.airplane.label}`;
    const notificationData = [
      `📅 ${dayjs(flight?.scheduledDepartureDateTime).format('DD/MM HH:mm')} ${
        flight?.dateConfirmed ? '✅' : '⚠️'
      } ${flight?.timeConfirmed ? '✅' : '⚠️'}`,
      `${flight?.authorized ? '✅ Autorizado' : '⚠️ Autorização Pendente'}`,
      `🛫 ${flight?.origin.label}`,
      `🛬 ${flight?.destination.label}`,
      `👥 ${flight?.requesters?.map((requester) => requester.requester?.label).join(', ')}`,
      `Changes: ${JSON.stringify(difference)}`,
    ];

    userIds.forEach(async (userId) => {
      await NotificationsCollection.insertAsync({
        type: 'flight-updated',
        flightId,
        title,
        message: `${dayjs(flight?.scheduledDepartureDateTime).format('DD/MM HH:mm')} de ${flight
          ?.origin?.label} para ${flight?.destination?.label}}`,
        read: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId!,
        updatedBy: this.userId!,
        userId,
      });

      // Send Push Notification
      await sendPushNotification({
        userId,
        payload: {
          title,
          body: notificationData.join('\n'),
          vibrate: [200, 100, 200],
          data: {
            flightId,
            userId,
          },
        },
      });
    });

    // Update Users collection
    await updateNotificationCount({ userIds });
  },
});
