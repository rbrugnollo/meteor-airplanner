import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import dayjs from 'dayjs';
import { incrementNotificationCount } from '../../users/methods/incrementNotificationCount';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';
import { sendPushNotification } from './sendPushNotification';

export const flightAuthorize = createMethod({
  name: 'notifications.flightAuthorize',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);

    if (!flight?.authorizer?.value || flight.authorizer.value === this.userId) return;

    const title = `Vôo Pendente de Autorização: ${flight.airplane.label}`;
    const notificationData = [
      `📅 ${dayjs(flight?.scheduledDepartureDateTime).format('DD/MM HH:mm')} ${
        flight?.dateConfirmed ? '✅' : '⚠️'
      } ${flight?.timeConfirmed ? '✅' : '⚠️'}`,
      `🛫 ${flight?.origin.label}`,
      `🛬 ${flight?.destination.label}`,
      `👥 ${flight?.requesters?.map((requester) => requester.requester?.label).join(', ')}`,
    ];

    await NotificationsCollection.insertAsync({
      type: 'flight-authorize',
      flightId,
      title,
      message: notificationData.join('\n'),
      read: false,
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
      userId: flight.authorizer.value,
    });

    // Update Users collection
    await incrementNotificationCount({ userIds: [flight.authorizer.value] });

    // Send Push Notification

    await sendPushNotification({
      userId: flight.authorizer.value,
      payload: {
        title,
        body: notificationData.join('\n'),
        vibrate: [200, 100, 200],
        data: {
          flightId,
          userId: flight.authorizer.value,
        },
        actions: [
          {
            action: 'authorize',
            title: 'Autorizar',
            type: 'button',
          },
          {
            action: 'close',
            title: 'Fechar',
            type: 'button',
          },
        ],
      },
    });
  },
});
