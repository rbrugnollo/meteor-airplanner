import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { FlightsCollection } from '../../flights/collection';

export const checkAvailability = createMethod({
  name: 'airplanes.checkAvailability',
  schema: z.object({
    flightId: z.string(),
    airplaneId: z.string(),
    dates: z.array(z.date()),
  }),
  async run({ flightId, airplaneId, dates }) {
    for (const dateToCheck of dates) {
      // Check Flights
      const airplaneFlights = await FlightsCollection.find({
        _id: { $ne: flightId },
        'airplane.value': airplaneId,
        scheduledDepartureDateTime: { $lte: dateToCheck },
        scheduledArrivalDateTime: { $gte: dateToCheck },
      }).fetchAsync();

      if (airplaneFlights.length > 0) {
        return 'There is a flight scheduled for this airplane at this date and time.';
      }

      // Check Maintenance
    }
    return null;
  },
});
