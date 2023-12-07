import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../collection';

export const authorize = createMethod({
  name: 'flights.authorize',
  schema: z.object({
    userId: z.string().optional(),
    flightId: z.string(),
    authorized: z.boolean(),
  }),
  async run({ userId, flightId, authorized }) {
    // Update
    await FlightsCollection.updateAsync(
      { _id: flightId },
      {
        $set: {
          authorized,
          updatedAt: new Date(),
          updatedBy: userId ?? this.userId!,
        },
      },
    );
  },
});
