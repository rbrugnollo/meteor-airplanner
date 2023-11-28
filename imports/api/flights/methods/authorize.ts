import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../collection';

export const authorize = createMethod({
  name: 'flights.authorize',
  schema: z.object({
    flightId: z.string(),
    authorized: z.boolean(),
  }),
  async run({ flightId, authorized }) {
    // Update
    await FlightsCollection.updateAsync(
      { _id: flightId },
      {
        $set: {
          authorized,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );
  },
});
