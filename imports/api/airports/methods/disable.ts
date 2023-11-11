import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirportsCollection } from '../collection';

export const disable = createMethod({
  name: 'airports.disable',
  schema: z.object({
    _id: z.string(),
  }),
  async run({ _id }) {
    await AirportsCollection.updateAsync({ _id }, { $set: { disabled: true } });
  },
});
