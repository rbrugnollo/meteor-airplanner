import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { find } from 'geo-tz';
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
          timezoneName: airport.timezoneName
            ? airport.timezoneName
            : find(parseFloat(airport.lat), parseFloat(airport.lon))[0],
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    updateFireAndForget({
      airport: { value: _id, label: `(${data.icao}) ${data.name} - ${data.city}` },
    });

    return result;
  },
});

export const updateFireAndForget = createMethod({
  name: 'airports.updateFireAndForget',
  schema: z.object({
    airport: ValueLabelTypeSchema,
  }),
  async run({ airport }) {
    const updateFlightsCollection = async () => {
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
    };
    const updateUsersCollection = async () => {
      await Meteor.users.updateAsync(
        { 'profile.base.value': airport.value },
        {
          $set: {
            'profile.base.label': airport.label,
          },
        },
        { multi: true },
      );
    };

    const updateAirplanesCollection = async () => {
      await AirplanesCollection.updateAsync(
        { 'base.value': airport.value },
        {
          $set: {
            'base.label': airport.label,
          },
        },
        { multi: true },
      );
    };

    const updateEventsCollection = async () => {
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
    };

    // Update dependent collections
    await Promise.all([
      updateFlightsCollection(),
      updateUsersCollection(),
      updateAirplanesCollection(),
      updateEventsCollection(),
    ]);
  },
});
