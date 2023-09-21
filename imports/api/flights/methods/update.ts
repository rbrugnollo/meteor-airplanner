import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';

export const update = createMethod({
  name: 'flights.update',
  schema: z.custom<Omit<Flight, IdBaseCollectionTypes>>(),
  async run(flight) {
    const { _id, ...data } = flight;
    return FlightsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );
  },
});
