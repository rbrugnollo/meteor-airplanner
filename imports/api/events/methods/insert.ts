import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { BaseCollectionTypes } from '../../common/BaseCollection';
import {
  Event,
  EventsCollection,
  FlightEvent,
  PilotInReserveEvent,
  PilotVacationEvent,
} from '../collection';

export const insert = createMethod({
  name: 'events.insert',
  schema: z.custom<Omit<Event, BaseCollectionTypes>>(),
  async run(event) {
    const typedEvent =
      event.type === 'Vacation'
        ? (event as PilotVacationEvent)
        : event.type === 'In Reserve'
        ? (event as PilotInReserveEvent)
        : event.type === 'Flight'
        ? (event as FlightEvent)
        : (event as Event);

    const eventId = await EventsCollection.insertAsync({
      ...typedEvent,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: this.userId!,
      updatedBy: this.userId!,
    });

    return eventId;
  },
});
