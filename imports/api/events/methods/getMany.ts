import { Roles } from 'meteor/alanning:roles';
import { NpmModuleMongodb } from 'meteor/npm-mongo';
import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../../airplanes/collection';
import { RoleName } from '../../users/collection';
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

    const userId = this.userId!;
    const roles = Roles.getRolesForUser(userId) as unknown as RoleName[];
    if (!roles.includes('Admin')) {
      const airplanes = await AirplanesCollection.find({
        $or: [{ 'captain.value': userId }, { 'manager.value': userId }],
      }).fetchAsync();
      const airplaneIds = airplanes.map((m) => m._id);
      andFilters = [
        ...andFilters,
        {
          $or: [
            {
              createdBy: userId,
            },
            {
              'pilot.value': userId,
            },
            {
              'flight.captain.value': userId,
            },
            {
              'flight.firstOfficer.value': userId,
            },
            {
              'flight.passengers.value': userId,
            },
            {
              'flight.requesters.requester.value': userId,
            },
            { 'flight.airplane.value': { $in: airplaneIds } },
            { 'airplane.value': { $in: airplaneIds } },
          ],
        },
      ];
    }

    return await EventsCollection.find({ $and: andFilters }).fetchAsync();
  },
});
