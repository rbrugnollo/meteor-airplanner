import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const searchByText = createMethod({
  name: 'airplanes.searchByText',
  schema: z.undefined(),
  run() {
    return AirplanesCollection.find({}, { sort: { name: 1 } }).fetch();
  },
});
