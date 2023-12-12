import { uniqBy } from 'lodash';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';
import { Airplane, AirplanesCollection } from '../collection';
import { updateInfo } from './updateInfo';

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

    const result = AirplanesCollection.updateAsync(
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

    updateFireAndForget({
      airplane: { value: _id, label: `(${data.tailNumber}) ${data.name}` },
    });

    return result;
  },
});

export const updateFireAndForget = createMethod({
  name: 'airplanes.updateFireAndForget',
  schema: z.object({
    airplane: ValueLabelTypeSchema,
  }),
  async run({ airplane }) {
    const updateFlightsCollection = async () => {
      await FlightsCollection.updateAsync(
        { 'airplane.value': airplane.value, scheduledDepartureDateTime: { $gte: new Date() } },
        {
          $set: {
            'airplane.label': airplane.label,
          },
        },
        { multi: true },
      );
    };
    const updateEventsCollection = async () => {
      await EventsCollection.updateAsync(
        { 'airplane.value': airplane.value, start: { $gte: new Date() } },
        {
          $set: {
            'airplane.label': airplane.label,
          },
        },
        { multi: true },
      );

      await EventsCollection.updateAsync(
        { 'flight.airplane.value': airplane.value, start: { $gte: new Date() } },
        {
          $set: {
            'flight.airplane.label': airplane.label,
          },
        },
        { multi: true },
      );
    };

    // Update the airplane info if possible
    await updateInfo({ _id: airplane.value });
    // Update dependent collections
    await updateFlightsCollection();
    await updateEventsCollection();
  },
});
