import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { FlightsCollection } from '../../flights/collection';
import { Airport, AirportsCollection } from '../collection';

export const update = createMethod({
  name: 'airports.update',
  schema: z.custom<Omit<Airport, IdBaseCollectionTypes>>(),
  async run(airport) {
    const { _id, ...data } = airport;
    const result = AirportsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    // Update dependent collections
    await updateFlightsCollection({
      airport: { value: _id, label: `(${data.icao}) ${data.name} - ${data.city}` },
    });

    return result;
  },
});

export const updateFlightsCollection = createMethod({
  name: 'airports.updateFlightsCollection',
  schema: z.object({
    airport: ValueLabelTypeSchema,
  }),
  async run({ airport }) {
    await FlightsCollection.updateAsync(
      { 'origin.value': airport.value },
      {
        $set: {
          'origin.label': airport.label,
        },
      },
      { multi: true },
    );
    await FlightsCollection.updateAsync(
      { 'destination.value': airport.value },
      {
        $set: {
          'destination.label': airport.label,
        },
      },
      { multi: true },
    );
  },
});
