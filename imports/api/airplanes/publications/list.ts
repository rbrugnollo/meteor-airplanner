import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const list = createPublication({
  name: 'airplanes.list',
  schema: z.undefined(),
  run() {
    return AirplanesCollection.find();
  },
});
