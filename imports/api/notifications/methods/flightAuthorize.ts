import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { incrementNotificationCount } from '../../users/methods/incrementNotificationCount';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';

export const flightAuthorize = createMethod({
  name: 'notifications.flightAuthorize',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);

    if (!flight?.authorizer?.value || flight.authorizer.value === this.userId) return;

    await NotificationsCollection.insertAsync({
      type: 'flight-authorize',
      flightId,
      title: `${flight?.airplane
        ?.label} - Autorizar vôo do dia ${flight?.scheduledDepartureDateTime?.toLocaleDateString()}`,
      message: `${flight?.origin?.label} - ${flight?.destination?.label}}`,
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
  },
});
