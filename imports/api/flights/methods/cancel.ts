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
    await FlightsCollection.updateAsync(
      { _id: flightId },
      {
        $set: {
          cancelled,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    // Send Notifications
    if (cancelled) await flightCancelled({ flightId });
  },
});
