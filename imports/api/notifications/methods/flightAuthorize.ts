import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../../airplanes/collection';
import { NotificationsCollection } from '../collection';
import { FlightsCollection } from '/imports/api/flights/collection';

export const flightAuthorize = createMethod({
  name: 'notifications.flightAuthorize',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);
    const airplane = await AirplanesCollection.findOneAsync(flight?.airplane?.value ?? '');
    const managerUserId = airplane?.manager?.value ?? '';

    if (!flight || !airplane || !managerUserId) return;

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
      userId: managerUserId,
    });
  },
});
