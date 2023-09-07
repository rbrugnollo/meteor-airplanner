import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { FlightsCollection } from '../collection';

export const insert = createMethod({
  name: 'flights.insert',
  schema: z.object({
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
    return FlightsCollection.insertAsync({
      ...flight,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });
  },
});
