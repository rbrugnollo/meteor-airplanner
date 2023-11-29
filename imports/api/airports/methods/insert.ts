import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { Airport, AirportsCollection } from '../collection';
import { find } from 'geo-tz';

export const insert = createMethod({
  name: 'airports.insert',
  schema: z.custom<Omit<Airport, BaseCollectionTypes>>(),
  async run(airport) {
    if (!airport.timezoneName)
      return AirportsCollection.insertAsync({
        ...airport,
        timezoneName: airport.timezoneName
          ? airport.timezoneName
          : find(parseFloat(airport.lat), parseFloat(airport.lon))[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId!,
        updatedBy: this.userId!,
      });
  },
});
