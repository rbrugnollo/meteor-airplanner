import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { FlightEvent, EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';

export const upsertEvent = createMethod({
  name: 'flights.upsertEvent',
  schema: z.string(),
  async run(flightId) {
    const flight = await FlightsCollection.findOneAsync(flightId);
    const event = await EventsCollection.findOneAsync(
      { 'flight._id': flightId },
      { projection: { _id: 1 } },
    );

    if (!flight) return;

    const eventDoc: Omit<FlightEvent, BaseCollectionTypes> = {
      type: 'Flight',
      title: `Flight from ${flight.origin.label} to ${flight.destination.label}`,
      start: flight.scheduledDepartureDateTime,
      end: flight.scheduledArrivalDateTime,
      flight,
    };

    if (event) {
      await EventsCollection.updateAsync(event._id, {
        $set: {
          ...eventDoc,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      });
    } else {
      await EventsCollection.insertAsync({
        ...eventDoc,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: this.userId!,
        updatedBy: this.userId!,
      });
    }
  },
});
