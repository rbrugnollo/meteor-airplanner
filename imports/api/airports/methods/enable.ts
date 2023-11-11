import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const enable = createMethod({
  name: 'airports.enable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await AirportsCollection.updateAsync({ _id }, { $unset: { disabled: true } });
  },
});
