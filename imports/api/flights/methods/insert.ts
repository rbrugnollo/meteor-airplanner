import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { ValueLabelType } from '../../common/ValueLabelType';
import { EventsCollection } from '../../events/collection';
import { Flight, FlightsCollection } from '../collection';
import { upsertFlightEvent } from './upsertFlightEvent';

export const insert = createMethod({
  name: 'flights.insert',
  schema: z.custom<Omit<Flight, BaseCollectionTypes>>(),
  async run(flight) {
    const result = await FlightsCollection.insertAsync({
      ...flight,
      status: 'Draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });

    // Update dependent collections
    await upsertFlightEvent(result);
    await insertInReserveEvents(result);

    return result;
  },
});

// A new In Reserve event is created if:
// 1. There are pilots on this flight
// 2. The pilot is in reserve
// 3. There is a following flight
export const insertInReserveEvents = createMethod({
  name: 'flights.insertInReserveEvents',
  schema: z.string(),
  async run(flightId) {
    const flight = (await FlightsCollection.findOneAsync(flightId))!;

    const insertIfFollowingFlight = async (pilot: ValueLabelType) => {
      const followingFlight = await FlightsCollection.findOneAsync({
        $or: [{ 'captain.value': pilot.value }, { 'firstOfficer.value': pilot.value }],
        scheduledDepartureDateTime: { $gte: flight.scheduledArrivalDateTime },
      });

      if (!followingFlight) return;

      // Insert new In Reserve event from the end of this flight to the start of the following flight
      await EventsCollection.insertAsync({
        type: 'In Reserve',
        start: flight.scheduledArrivalDateTime,
        end: followingFlight.scheduledDepartureDateTime,
        pilot,
        flightId,
        title: `${pilot.label} In Reserve`,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId!,
        updatedBy: this.userId!,
      });

      // Update previous In Reserve event if this flight is in the middle of the event
      await EventsCollection.updateAsync(
        {
          type: 'In Reserve',
          pilot: pilot.value,
          start: { $lte: flight.scheduledDepartureDateTime },
          end: { $gte: flight.scheduledDepartureDateTime },
        },
        {
          $set: {
            end: flight.scheduledDepartureDateTime,
            updatedAt: new Date(),
            updatedBy: this.userId!,
          },
        },
        { multi: true },
      );
    };

    if (flight.captain && flight.captainInReserve) await insertIfFollowingFlight(flight.captain);
    if (flight.firstOfficer && flight.firstOfficerInReserve)
      await insertIfFollowingFlight(flight.firstOfficer);
  },
});
