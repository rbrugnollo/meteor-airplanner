import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';
import { upsertEvent } from './upsertEvent';

export const update = createMethod({
  name: 'flights.update',
  schema: z.custom<Omit<Flight, IdBaseCollectionTypes>>(),
  async run(flight) {
    const { _id, ...data } = flight;
    const result = await FlightsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    // Update dependent collections
    await upsertEvent(_id);

    return result;
  },
});
