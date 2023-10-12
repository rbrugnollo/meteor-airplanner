import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { z } from 'zod';
import { Event, EventsCollection } from '../collection';

export const list = createPublication({
  name: 'events.list',
  schema: z.object({
    selector: z.custom<Mongo.Selector<Event>>(),
  }),
  run({ selector }) {
    return EventsCollection.find(selector);
  },
});
