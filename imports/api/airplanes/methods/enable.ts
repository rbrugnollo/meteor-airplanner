import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../collection';

export const enable = createMethod({
  name: 'airplanes.enable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await AirplanesCollection.updateAsync({ _id }, { $unset: { disabled: true } });
  },
});
