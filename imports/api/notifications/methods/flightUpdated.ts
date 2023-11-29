import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import dayjs from 'dayjs';
import { incrementNotificationCount } from '../../users/methods/incrementNotificationCount';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';

export const flightUpdated = createMethod({
  name: 'notifications.flightUpdated',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);

    const users = await Meteor.users.find().fetchAsync();
    const userIds = users
      .filter((f) => f.profile?.notifications?.['flight-updated']?.push)
      .map((m) => m._id)
      .filter((m) => m && m !== this.userId);

    userIds.forEach(async (userId) => {
      await NotificationsCollection.insertAsync({
        type: 'flight-updated',
        flightId,
        title: `${flight?.airplane?.label} - Vôo alterado`,
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
    });

    // Update Users collection
    await incrementNotificationCount({ userIds });
  },
});
