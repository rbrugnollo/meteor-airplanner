import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../collection';

export const publishGroup = createMethod({
  name: 'flights.publishGroup',
  schema: z.string(),
  async run(flightGroupId) {
    const result = await FlightsCollection.updateAsync(
      { groupId: flightGroupId },
      {
        $set: {
          published: true,
        },
      },
      { multi: true },
    );
    return result;
  },
});
