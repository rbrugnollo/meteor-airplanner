import { Meteor } from 'meteor/meteor';
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
    const user = await Meteor.users.findOneAsync(this.userId!);

    // Update
    await FlightsCollection.updateAsync(
      { _id: flightId },
      {
        $set: {
          authorized,
          updatedAt: new Date(),
          updatedBy: this.userId!,
          updatedByName: user?.profile?.name ?? this.userId!,
        },
      },
    );
  },
});
