import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import { EventsCollection, AirplaneMaintenanceEvent } from '../../events/collection';
import { FlightsCollection } from '../collection';

export const upsertMaintenanceEvent = createMethod({
  name: 'flights.upsertMaintenanceEvent',
  schema: z.object({
    flightId: z.string(),
    checkPreviousFlight: z.boolean(),
  }),
  async run({ flightId, checkPreviousFlight }) {
    const flight = (await FlightsCollection.findOneAsync(flightId))!;

    const existingEvent = await EventsCollection.findOneAsync({
      type: 'Maintenance',
      flightId,
    });
    const followingFlight = FlightsCollection.findOne(
      {
        groupId: flight.groupId,
        createdAt: { $gt: flight.createdAt },
      },
      { sort: { createdAt: 1 } },
    );
    const previousFlight = FlightsCollection.findOne(
      {
        groupId: flight.groupId,
        createdAt: { $lt: flight.createdAt },
      },
      { sort: { createdAt: -1 } },
    );

    // If there's an event but it's not more relevant, delete it
    if (existingEvent && !flight.maintenance) {
      await EventsCollection.removeAsync(existingEvent._id);
    } else if (followingFlight && flight.maintenance) {
      const eventDoc: Omit<AirplaneMaintenanceEvent, BaseCollectionTypes> = {
        type: 'Maintenance',
        title: 'Airplane Maintenance',
        flightId,
        start: flight.scheduledArrivalDateTime,
        end: followingFlight.scheduledDepartureDateTime,
        airplane: flight.airplane,
      };
      if (existingEvent) {
        await EventsCollection.updateAsync(
          existingEvent._id,
          {
            $set: {
              ...eventDoc,
              updatedAt: new Date(),
              updatedBy: this.userId!,
            },
          },
          { multi: true },
        );
      } else {
        // insert
        await EventsCollection.insertAsync({
          ...eventDoc,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: this.userId!,
          updatedBy: this.userId!,
        });
      }
    }

    // Process Previous Flight
    if (previousFlight && checkPreviousFlight) {
      await upsertMaintenanceEvent({
        flightId: previousFlight._id,
        checkPreviousFlight: false,
      });
    }
  },
});
