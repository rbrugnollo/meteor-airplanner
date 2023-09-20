import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Airport, AirportsCollection } from '../collection';

export const insert = createMethod({
  name: 'airports.insert',
  schema: z.custom<Omit<Airport, BaseCollectionTypes>>(),
  async run(airport) {
    return AirportsCollection.insertAsync({
      ...airport,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
