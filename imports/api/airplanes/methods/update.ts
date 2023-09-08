import { uniqBy } from 'lodash';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { FlightsCollection } from '../../flights/collection';
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
    let pilots = airplane.pilots ?? [];
    if (airplane.captain) {
      pilots = [...pilots, airplane.captain];
    }
    if (airplane.firstOfficer) {
      pilots = [...pilots, airplane.firstOfficer];
    }
    pilots = uniqBy(pilots, 'value');
    return AirplanesCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          pilots,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );
  },
});

export const updateFligtsCollection = createMethod({
  name: 'airplanes.updateFligtsCollection',
  schema: z.object({
    airplane: ValueLabelTypeSchema,
  }),
  async run({ airplane }) {
    await FlightsCollection.updateAsync(
      { 'airplane.value': airplane.value },
      {
        $set: {
          'airplane.label': airplane.label,
        },
      },
      { multi: true },
    );
  },
});
