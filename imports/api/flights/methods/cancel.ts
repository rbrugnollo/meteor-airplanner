import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { flightCancelled } from '../../notifications/methods/flightCancelled';
import { FlightsCollection } from '../collection';

export const cancel = createMethod({
  name: 'flights.cancel',
  schema: z.object({
    flightId: z.string(),
    cancelled: z.boolean(),
  }),
  async run({ flightId, cancelled }) {
    // Update
    const user = await Meteor.users.findOneAsync(this.userId!);
    await FlightsCollection.updateAsync(
      { _id: flightId },
      {
        $set: {
          cancelled,
          updatedAt: new Date(),
          updatedBy: this.userId!,
          updatedByLabel: user?.profile?.name ?? '',
        },
      },
    );

    cancelFireAndForget({ flightId });
  },
});

export const cancelFireAndForget = createMethod({
  name: 'flights.cancelFireAndForget',
  schema: z.object({
    flightId: z.string(),
  }),
  async run({ flightId }) {
    const flight = await FlightsCollection.findOneAsync(flightId);
    if (!flight) return;

    if (flight.cancelled) {
      // // Update dependent collections
      // await removeFlightEvent(flightId);
      // await removeInReserveEvents({
      //   flightBeforeUpdate: flight,
      //   checkPreviousFlight: true,
      // });
      // await upsertMaintenanceEvent({ flightId, checkPreviousFlight: true });
      // if (flight.published) await publishGroup(flight.groupId);

      // Send Notifications
      await flightCancelled({ flightId });
    }
  },
});
