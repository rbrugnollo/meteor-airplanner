import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const update = createMethod({
  name: 'airplanes.update',
  schema: z.object({
    _id: z.string(),
    name: z.string(),
    tailNumber: z.string(),
  }),
  async run(airplane) {
    const { _id, ...data } = airplane;
    return AirplanesCollection.updateAsync({ _id }, { $set: data });
  },
});
