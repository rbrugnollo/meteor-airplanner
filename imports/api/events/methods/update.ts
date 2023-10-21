import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { IdBaseCollectionTypes } from '../../common/BaseCollection';
import {
  Event,
  EventsCollection,
  FlightEvent,
  PilotInReserveEvent,
  PilotVacationEvent,
} from '../collection';

export const update = createMethod({
  name: 'events.update',
  schema: z.custom<Omit<Event, IdBaseCollectionTypes>>(),
  async run(event) {
    const typedEvent =
      event.type === 'Vacation'
        ? (event as PilotVacationEvent)
        : event.type === 'In Reserve'
        ? (event as PilotInReserveEvent)
        : event.type === 'Flight'
        ? (event as FlightEvent)
        : (event as Event);

    const { _id, ...data } = typedEvent;

    const result = EventsCollection.updateAsync(
      { _id },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
          updatedBy: this.userId!,
        },
      },
    );

    return result;
  },
});
