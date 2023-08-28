import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { AirplanesCollection } from '../collection';

export const insert = createMethod({
  name: 'airplanes.insert',
  schema: z.object({
    name: z.string(),
    tailNumber: z.string(),
    captain: ValueLabelTypeSchema.optional(),
    firstOfficer: ValueLabelTypeSchema.optional(),
    manager: ValueLabelTypeSchema.optional(),
    pilots: z.array(ValueLabelTypeSchema).optional(),
  }),
  async run(airplane) {
    return AirplanesCollection.insertAsync({
      ...airplane,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
