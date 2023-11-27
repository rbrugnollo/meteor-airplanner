import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';

export const flightCancelled = createMethod({
  name: 'notifications.flightCancelled',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);

    const users = await Meteor.users.find().fetchAsync();
    const userIds = users
      .filter((f) => f.profile?.notifications?.['flight-cancelled']?.push)
      .map((m) => m._id)
      .filter((m) => m);

    userIds.forEach(async (userId) => {
      await NotificationsCollection.insertAsync({
        type: 'flight-updated',
        flightId,
        title: `${flight?.airplane
          ?.label} - Vôo cancelado ${flight?.scheduledDepartureDateTime?.toLocaleDateString()}`,
        message: `${flight?.origin?.label} - ${flight?.destination?.label}}`,
        read: false,
        archived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId!,
        updatedBy: this.userId!,
        userId,
      });
    });
  },
});
