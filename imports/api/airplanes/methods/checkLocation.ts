import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../../flights/collection';

export const checkLocation = createMethod({
  name: 'airplanes.checkLocation',
  schema: z.object({
    airplaneId: z.string(),
    airportId: z.string(),
    dateToCheck: z.date(),
  }),
  async run({ airplaneId, airportId, dateToCheck }) {
    // Get Last Flight Before Date
    const flight = await FlightsCollection.findOneAsync(
      {
        'airplane.value': airplaneId,
        scheduledArrivalDateTime: { $lte: dateToCheck },
      },
      { sort: { scheduledArrivalDateTime: -1 } },
    );

    if (flight && flight.destination?.value !== airportId) {
      return `The airplane is going to be at ${flight.destination?.label} at this date and time.`;
    }

    return null;
  },
});