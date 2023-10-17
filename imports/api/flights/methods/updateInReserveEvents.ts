import { Meteor } from 'meteor/meteor';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { ValueLabelType } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { Flight, FlightsCollection } from '../collection';

export const updateInReserveEvents = createMethod({
  name: 'flights.updateInReserveEvents',
  schema: z.object({
    flightBeforeUpdate: z.custom<Flight>(),
    checkPreviousFlight: z.boolean(),
  }),
  async run({ flightBeforeUpdate, checkPreviousFlight }) {
    const flightAfterUpdate = (await FlightsCollection.findOneAsync(flightBeforeUpdate._id))!;

    // Update In Reserve events for pilots:
    const upsertEvent = async (pilotInReserve: boolean, pilotId?: string) => {
      if (!pilotId) return;
      const pilot = await Meteor.users.findOneAsync(pilotId);
      if (!pilot) return;

      const existingEvent = await EventsCollection.findOneAsync({
        type: 'In Reserve',
        flightId: flightAfterUpdate._id,
        'pilot.value': pilotId,
      });
      const followingFlight = await FlightsCollection.findOneAsync({
        $or: [{ 'captain.value': pilotId }, { 'firstOfficer.value': pilotId }],
        scheduledDepartureDateTime: { $gte: flightAfterUpdate.scheduledArrivalDateTime },
      });
      const previousFlight = await FlightsCollection.findOneAsync(
        {
          $or: [{ 'captain.value': pilotId }, { 'firstOfficer.value': pilotId }],
          scheduledArrivalDateTime: { $lte: flightAfterUpdate.scheduledDepartureDateTime },
        },
        { sort: { scheduledArrivalDateTime: -1 } },
      );

      // If there's an event but it's not more relevant, delete it
      if (
        existingEvent &&
        (!pilotInReserve ||
          !followingFlight ||
          pilot.profile?.base?.value === flightAfterUpdate.destination.value)
      ) {
        await EventsCollection.removeAsync(existingEvent._id);
      } else if (followingFlight) {
        const eventData = {
          flightId: flightAfterUpdate._id,
          start: flightAfterUpdate.scheduledArrivalDateTime,
          end: followingFlight.scheduledDepartureDateTime,
          pilot: {
            value: pilotId,
            label: pilot.profile?.name ?? '',
          },
          title: `${pilot.profile?.name} In Reserve`,
        };

        if (existingEvent) {
          await EventsCollection.updateAsync(
            existingEvent._id,
            {
              $set: {
                ...eventData,
                updatedAt: new Date(),
                updatedBy: this.userId!,
              },
            },
            { multi: true },
          );
        } else {
          // insert
          await EventsCollection.insertAsync({
            type: 'In Reserve',
            ...eventData,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: this.userId!,
            updatedBy: this.userId!,
          });
        }
      }

      // If Pilot has previous flights, process then to create In Reserve events
      if (previousFlight && checkPreviousFlight) {
        await updateInReserveEvents({
          flightBeforeUpdate: previousFlight,
          checkPreviousFlight: false,
        });
      }
    };

    await upsertEvent(flightAfterUpdate.captainInReserve, flightAfterUpdate.captain?.value);
    await upsertEvent(
      flightAfterUpdate.firstOfficerInReserve,
      flightAfterUpdate.firstOfficer?.value,
    );

    // Delete Events and reprocess previous flight if the pilot changed
    const deleteAndUpdatePreviousFlight = async (
      pilotBeforeUpdateInReserve: boolean,
      pilotBeforeUpdate: ValueLabelType,
    ) => {
      if (pilotBeforeUpdateInReserve) {
        await EventsCollection.removeAsync({
          type: 'In Reserve',
          flightId: flightBeforeUpdate._id,
          'pilot.value': pilotBeforeUpdate.value,
        });
      }
      const previousFlight = await FlightsCollection.findOneAsync(
        {
          $or: [
            { 'captain.value': pilotBeforeUpdate.value },
            { 'firstOfficer.value': pilotBeforeUpdate.value },
          ],
          scheduledArrivalDateTime: { $lte: flightBeforeUpdate.scheduledDepartureDateTime },
        },
        { sort: { scheduledArrivalDateTime: -1 } },
      );
      if (previousFlight && checkPreviousFlight) {
        await updateInReserveEvents({
          flightBeforeUpdate: previousFlight,
          checkPreviousFlight: false,
        });
      }
    };

    if (
      flightBeforeUpdate.captain &&
      flightBeforeUpdate.captain.value !== flightAfterUpdate.captain?.value
    )
      await deleteAndUpdatePreviousFlight(
        flightBeforeUpdate.captainInReserve,
        flightBeforeUpdate.captain,
      );

    if (
      flightBeforeUpdate.firstOfficer &&
      flightBeforeUpdate.firstOfficer.value !== flightAfterUpdate.firstOfficer?.value
    )
      await deleteAndUpdatePreviousFlight(
        flightBeforeUpdate.firstOfficerInReserve,
        flightBeforeUpdate.firstOfficer,
      );
  },
});
