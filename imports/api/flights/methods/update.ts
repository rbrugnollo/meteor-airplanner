import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { FlightsCollection } from '../collection';

export const update = createMethod({
  name: 'flights.update',
  schema: z.object({
    _id: z.string(),
    airplane: ValueLabelTypeSchema,
    scheduledDateTime: z.date(),
    estimatedDuration: z.string(),
    origin: ValueLabelTypeSchema,
    destination: ValueLabelTypeSchema,
    captain: ValueLabelTypeSchema.optional(),
    firstOfficer: ValueLabelTypeSchema.optional(),
    passengers: z.array(ValueLabelTypeSchema).optional(),
    requesters: z
      .object({
        requester: ValueLabelTypeSchema.optional(),
        costCenter: ValueLabelTypeSchema.optional(),
        percentage: z.number().optional(),
      })
      .array()
      .optional(),
    notes: z.string().optional(),
  }),
  async run(flight) {
    const { _id, ...data } = flight;
    return FlightsCollection.updateAsync(
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
