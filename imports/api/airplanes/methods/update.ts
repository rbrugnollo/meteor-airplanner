import { uniqBy } from 'lodash';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { FlightsCollection } from '../../flights/collection';
import { Airplane, AirplanesCollection } from '../collection';

export const update = createMethod({
  name: 'airplanes.update',
  schema: z.custom<Omit<Airplane, IdBaseCollectionTypes>>(),
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
