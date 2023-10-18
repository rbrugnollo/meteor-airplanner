import { NpmModuleMongodb } from 'meteor/npm-mongo';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection, Event } from '../collection';

export const getMany = createMethod({
  name: 'events.getMany',
  schema: z.object({
    from: z.date(),
    to: z.date(),
    pilots: z.array(z.string()),
    airplanes: z.array(z.string()),
  }),
  async run({ from, to, pilots, airplanes }) {
    let andFilters: NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Event>>[] = [
      {
        start: {
          $gte: from,
          $lte: to,
        },
      },
    ];
    if (pilots.length) {
      andFilters = [
        ...andFilters,
        {
          $or: [
            { 'pilot.value': { $in: pilots } },
            { 'flight.captain.value': { $in: pilots } },
            { 'flight.firstOfficer.value': { $in: pilots } },
          ],
        },
      ];
    }
    if (airplanes.length) {
      andFilters = [
        ...andFilters,
        {
          $or: [
            { 'flight.airplane.value': { $in: airplanes } },
            { 'flight.airplane.value': { $exists: false } },
          ],
        },
      ];
    }
    return await EventsCollection.find({ $and: andFilters }).fetchAsync();
  },
});
