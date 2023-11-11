import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const disable = createMethod({
  name: 'airplanes.disable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await AirplanesCollection.updateAsync({ _id }, { $set: { disabled: true } });
  },
});
