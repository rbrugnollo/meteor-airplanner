import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../../flights/collection';

export const checkLocation = createMethod({
  name: 'airplanes.checkLocation',
  schema: z.object({
    flightId: z.string(),
    airplaneId: z.string(),
    airportId: z.string(),
    dateToCheck: z.date(),
  }),
  async run({ flightId, airplaneId, airportId, dateToCheck }) {
    // Get Last Flight Before Date
    const flight = await FlightsCollection.findOneAsync(
      {
        _id: { $ne: flightId },
        'airplane.value': airplaneId,
        scheduledArrivalDateTime: { $lte: dateToCheck },
      },
      { sort: { scheduledArrivalDateTime: -1 } },
    );

    if (flight && flight.destination?.value !== airportId) {
      return `A aeronave estará em ${flight.destination?.label} nesta data e hora.`;
    }

    return null;
  },
});
