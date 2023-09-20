import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { Airport, AirportsCollection } from '../collection';

export const update = createMethod({
  name: 'airports.update',
  schema: z.custom<Omit<Airport, IdBaseCollectionTypes>>(),
  async run(airport) {
    const { _id, ...data } = airport;
    return AirportsCollection.updateAsync(
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
