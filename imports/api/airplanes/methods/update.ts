import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { AirplanesCollection } from '../collection';

export const update = createMethod({
  name: 'airplanes.update',
  schema: z.object({
    _id: z.string(),
    name: z.string(),
    tailNumber: z.string(),
    captain: ValueLabelTypeSchema.optional(),
    firstOfficer: ValueLabelTypeSchema.optional(),
    manager: ValueLabelTypeSchema.optional(),
    pilots: z.array(ValueLabelTypeSchema).optional(),
  }),
  async run(airplane) {
    const { _id, ...data } = airplane;
    return AirplanesCollection.updateAsync(
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
