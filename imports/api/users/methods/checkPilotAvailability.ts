import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection } from '../../events/collection';
import { FlightsCollection } from '../../flights/collection';

export const checkPilotAvailability = createMethod({
  name: 'users.checkPilotAvailability',
  schema: z.object({
    flightId: z.string(),
    userId: z.string(),
    dates: z.array(z.date()),
  }),
  async run({ flightId, userId, dates }) {
    for (const dateToCheck of dates) {
      // Check Flights
      const pilotFlights = await FlightsCollection.find({
        _id: { $ne: flightId },
        $or: [
          {
            'captain.value': userId,
          },
          {
            'firstOfficer.value': userId,
          },
        ],
        scheduledDepartureDateTime: { $lte: dateToCheck },
        scheduledArrivalDateTime: { $gte: dateToCheck },
      }).fetchAsync();

      if (pilotFlights.length > 0) {
        return 'O piloto tem um vôo agendado para esta data e hora.';
      }

      // Check Vacation
      const maintenanceEvents = await EventsCollection.find({
        type: 'Vacation',
        'pilot.value': userId,
        start: { $lte: dateToCheck },
        end: { $gte: dateToCheck },
      }).fetchAsync();

      if (maintenanceEvents.length > 0) {
        return 'O piloto não está disponível nesta data e hora.';
      }
    }
    return null;
  },
});
