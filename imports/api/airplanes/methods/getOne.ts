import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const getOne = createMethod({
  name: 'airplanes.getOne',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    return AirplanesCollection.findOneAsync(_id);
  },
});
