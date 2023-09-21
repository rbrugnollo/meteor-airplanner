import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Flight, FlightsCollection } from '../collection';

export const insert = createMethod({
  name: 'flights.insert',
  schema: z.custom<Omit<Flight, BaseCollectionTypes>>(),
  async run(flight) {
    return FlightsCollection.insertAsync({
      ...flight,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
