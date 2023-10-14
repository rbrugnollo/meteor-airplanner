import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelType } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { Flight, FlightsCollection } from '../collection';
import { upsertFlightEvent } from './upsertFlightEvent';

export const update = createMethod({
  name: 'flights.update',
  schema: z.custom<Omit<Flight, IdBaseCollectionTypes>>(),
  async run(flight) {
    const { _id, ...data } = flight;
    const flightBeforeUpdate = await FlightsCollection.findOneAsync(_id);
    const result = await FlightsCollection.updateAsync(
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
    await upsertFlightEvent(_id);
    await updateInReserveEvents(flightBeforeUpdate!);

    return result;
  },
});

export const updateInReserveEvents = createMethod({
  name: 'flights.updateInReserveEvents',
  schema: z.custom<Flight>(),
  async run(flightBeforeUpdate) {
    const flightAfterUpdate = (await FlightsCollection.findOneAsync(flightBeforeUpdate._id))!;

    // Update In Reserve events for pilots:
    const upsertEvent = async (pilotInReserve: boolean, pilot?: ValueLabelType | null) => {
      if (!pilot) return;

      const existingEvent = await EventsCollection.findOneAsync({
        type: 'In Reserve',
        flightId: flightAfterUpdate._id,
        'pilot.value': pilot.value,
      });
      const followingFlight = await FlightsCollection.findOneAsync({
        $or: [{ 'captain.value': pilot.value }, { 'firstOfficer.value': pilot.value }],
        scheduledDepartureDateTime: { $gte: flightAfterUpdate.scheduledArrivalDateTime },
      });

      // If there's an event but it's not more relevant, delete it
      if (existingEvent && (!pilotInReserve || !followingFlight)) {
        await EventsCollection.removeAsync(existingEvent._id);
      } else {
        if (followingFlight && existingEvent) {
          await EventsCollection.updateAsync(
            existingEvent._id,
            {
              $set: {
                start: flightAfterUpdate.scheduledArrivalDateTime,
                end: followingFlight.scheduledDepartureDateTime,
                pilot: pilot,
                title: `${pilot.label} In Reserve`,
                updatedAt: new Date(),
                updatedBy: this.userId!,
              },
            },
            { multi: true },
          );
        } else if (followingFlight && !existingEvent) {
          // insert
          await EventsCollection.insertAsync({
            type: 'In Reserve',
            start: flightAfterUpdate.scheduledArrivalDateTime,
            end: followingFlight.scheduledDepartureDateTime,
            pilot: pilot,
            flightId: flightAfterUpdate._id,
            title: `${pilot.label} In Reserve`,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: this.userId!,
            updatedBy: this.userId!,
          });
        }
        // Update previous In Reserve event if this flight is in the middle of the event
        await EventsCollection.updateAsync(
          {
            type: 'In Reserve',
            pilot: pilot.value,
            start: { $lte: flightAfterUpdate.scheduledDepartureDateTime },
            end: { $gte: flightAfterUpdate.scheduledDepartureDateTime },
          },
          {
            $set: {
              end: flightAfterUpdate.scheduledDepartureDateTime,
              updatedAt: new Date(),
              updatedBy: this.userId!,
            },
          },
          { multi: true },
        );
      }
    };

    upsertEvent(flightAfterUpdate.captainInReserve, flightAfterUpdate.captain);
    upsertEvent(flightAfterUpdate.firstOfficerInReserve, flightAfterUpdate.firstOfficer);

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
      const previousFlight = await FlightsCollection.findOneAsync({
        $or: [
          { 'captain.value': pilotBeforeUpdate.value },
          { 'firstOfficer.value': pilotBeforeUpdate.value },
        ],
        scheduledArrivalDateTime: { $lte: flightBeforeUpdate.scheduledDepartureDateTime },
      });
      if (previousFlight) {
        await updateInReserveEvents(previousFlight);
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
