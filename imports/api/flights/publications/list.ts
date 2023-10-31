import { Roles } from 'meteor/alanning:roles';
import { Mongo } from 'meteor/mongo';
import { createPublication } from 'meteor/zodern:relay';
import { NpmModuleMongodb } from 'meteor/npm-mongo';
import { z } from 'zod';
import { RoleName } from '../../users/collection';
import { Flight, FlightsCollection } from '../collection';
import { AirplanesCollection } from '../../airplanes/collection';

export const list = createPublication({
  name: 'flights.list',
  schema: z.object({
    andFilters: z.custom<NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>>().array(),
    options: z.custom<Mongo.Options<Flight>>(),
  }),
  async run({ andFilters, options }) {
    const userId = this.userId!;

    let userAndFilters: NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>[] = [
      ...andFilters,
    ];

    const roles = Roles.getRolesForUser(userId) as unknown as RoleName[];
    if (!roles.includes('Admin')) {
      const airplanes = await AirplanesCollection.find({
        $or: [{ 'captain.value': userId }, { 'manager.value': userId }],
      }).fetchAsync();
      const airplaneIds = airplanes.map((m) => m._id);

      userAndFilters = [
        ...userAndFilters,
        {
          $or: [
            {
              published: true,
            },
            {
              createdBy: userId,
            },
          ],
        },
        {
          $or: [
            {
              createdBy: userId,
            },
            {
              'captain.value': userId,
            },
            {
              'firstOfficer.value': userId,
            },
            {
              'passengers.value': userId,
            },
            {
              'requesters.requester.value': userId,
            },
            { 'airplane.value': { $in: airplaneIds } },
          ],
        },
      ];
    }

    return FlightsCollection.find(userAndFilters.length ? { $and: userAndFilters } : {}, options);
  },
});
