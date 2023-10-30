import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../../airplanes/collection';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';
import { Airport, AirportsCollection } from '../collection';

export const update = createMethod({
  name: 'airports.update',
  schema: z.custom<Omit<Airport, IdBaseCollectionTypes>>(),
  async run(airport) {
    const { _id, ...data } = airport;
    const result = await AirportsCollection.updateAsync(
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

    await updateFlightsCollection({
      airport: { value: _id, label: `(${data.icao}) ${data.name} - ${data.city}` },
    });

    await updateAirplanesCollection({
      airport: { value: _id, label: `(${data.icao}) ${data.name} - ${data.city}` },
    });

    await updateEventsCollection({
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
      { 'origin.value': airport.value, scheduledDepartureDateTime: { $gte: new Date() } },
      {
        $set: {
          'origin.label': airport.label,
        },
      },
      { multi: true },
    );
    await FlightsCollection.updateAsync(
      { 'destination.value': airport.value, scheduledDepartureDateTime: { $gte: new Date() } },
      {
        $set: {
          'destination.label': airport.label,
        },
      },
      { multi: true },
    );
  },
});

export const updateUsersCollection = createMethod({
  name: 'airports.updateUsersCollection',
  schema: z.object({
    airport: ValueLabelTypeSchema,
  }),
  async run({ airport }) {
    await Meteor.users.updateAsync(
      { 'profile.base.value': airport.value },
      {
        $set: {
          'profile.base.label': airport.label,
        },
      },
      { multi: true },
    );
  },
});

export const updateAirplanesCollection = createMethod({
  name: 'airports.updateAirplanesCollection',
  schema: z.object({
    airport: ValueLabelTypeSchema,
  }),
  async run({ airport }) {
    await AirplanesCollection.updateAsync(
      { 'base.value': airport.value },
      {
        $set: {
          'base.label': airport.label,
        },
      },
      { multi: true },
    );
  },
});

export const updateEventsCollection = createMethod({
  name: 'airports.updateEventsCollection',
  schema: z.object({
    airport: ValueLabelTypeSchema,
  }),
  async run({ airport }) {
    await EventsCollection.updateAsync(
      { 'flight.origin.value': airport.value, start: { $gte: new Date() } },
      {
        $set: {
          'flight.origin.label': airport.label,
        },
      },
      { multi: true },
    );
    await EventsCollection.updateAsync(
      {
        'flight.destination.value': airport.value,
        start: { $gte: new Date() },
      },
      {
        $set: {
          'flight.destination.label': airport.label,
        },
      },
      { multi: true },
    );
  },
});
