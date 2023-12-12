import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../../airplanes/collection';
import { ValueLabelTypeSchema } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';
import { removeDefault } from './removeDefault';

export const update = createMethod({
  name: 'users.update',
  schema: z.object({
    _id: z.string(),
    email: z.string(),
    name: z.string(),
    roles: z.any().array(),
    base: ValueLabelTypeSchema.optional(),
  }),
  async run({ _id, name, email, roles, base }) {
    const userProps = {
      username: email,
      profile: {
        name,
        roles,
        base,
      },
      'emails.0.address': email,
    };
    await Meteor.users.updateAsync({ _id }, { $set: userProps });
    Roles.setUserRoles(_id, roles);

    // Fire and Forget
    updateFireAndForget({ user: { value: _id, label: name } });
  },
});

export const updateFireAndForget = createMethod({
  name: 'users.updateFireAndForget',
  schema: z.object({
    user: ValueLabelTypeSchema,
  }),
  async run({ user }) {
    const updateAirplanesCollection = async () => {
      await AirplanesCollection.updateAsync(
        { 'captain.value': user.value },
        {
          $set: {
            'captain.label': user.label,
          },
        },
        { multi: true },
      );
      await AirplanesCollection.updateAsync(
        { 'firstOfficer.value': user.value },
        {
          $set: {
            'firstOfficer.value': user.label,
          },
        },
        { multi: true },
      );
      await AirplanesCollection.updateAsync(
        { 'manager.value': user.value },
        {
          $set: {
            'firstOfficer.value': user.label,
          },
        },
        { multi: true },
      );
      await AirplanesCollection.updateAsync(
        { 'pilots.value': user.value },
        {
          $set: {
            'pilots.$.label': user.label,
          },
        },
        { multi: true },
      );
    };

    const updateFlightsCollection = async () => {
      await FlightsCollection.updateAsync(
        { 'captain.value': user.value, scheduledDepartureDateTime: { $gte: new Date() } },
        {
          $set: {
            'captain.label': user.label,
          },
        },
        { multi: true },
      );
      await FlightsCollection.updateAsync(
        { 'firstOfficer.value': user.value, scheduledDepartureDateTime: { $gte: new Date() } },
        {
          $set: {
            'firstOfficer.value': user.label,
          },
        },
        { multi: true },
      );
      await FlightsCollection.updateAsync(
        { 'authorizer.value': user.value, scheduledDepartureDateTime: { $gte: new Date() } },
        {
          $set: {
            'authorizer.value': user.label,
          },
        },
        { multi: true },
      );
      await FlightsCollection.updateAsync(
        { 'passengers.value': user.value, scheduledDepartureDateTime: { $gte: new Date() } },
        {
          $set: {
            'passengers.$.label': user.label,
          },
        },
        { multi: true },
      );
      await FlightsCollection.updateAsync(
        {
          'requesters.requester.value': user.value,
          scheduledDepartureDateTime: { $gte: new Date() },
        },
        {
          $set: {
            'requesters.$.requester.label': user.label,
          },
        },
        { multi: true },
      );
    };

    const updateEventsCollection = async () => {
      await EventsCollection.updateAsync(
        { 'flight.captain.value': user.value, start: { $gte: new Date() } },
        {
          $set: {
            'flight.captain.label': user.label,
          },
        },
        { multi: true },
      );
      await EventsCollection.updateAsync(
        { 'flight.firstOfficer.value': user.value, start: { $gte: new Date() } },
        {
          $set: {
            'flight.firstOfficer.value': user.label,
          },
        },
        { multi: true },
      );
      await EventsCollection.updateAsync(
        { 'flight.passengers.value': user.value, start: { $gte: new Date() } },
        {
          $set: {
            'flight.passengers.$.label': user.label,
          },
        },
        { multi: true },
      );
      await EventsCollection.updateAsync(
        {
          'flight.requesters.requester.value': user.value,
          start: { $gte: new Date() },
        },
        {
          $set: {
            'flight.requesters.$.requester.label': user.label,
          },
        },
        { multi: true },
      );
      await EventsCollection.updateAsync(
        {
          'pilot.value': user.value,
          start: { $gte: new Date() },
        },
        {
          $set: {
            'pilot.label': user.label,
          },
        },
        { multi: true },
      );
    };

    // Remove default user if possible
    await removeDefault();
    // Update Dependent Collections
    await Promise.all([
      updateAirplanesCollection(),
      updateFlightsCollection(),
      updateEventsCollection(),
    ]);
  },
});
