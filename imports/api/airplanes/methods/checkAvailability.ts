import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { EventsCollection } from '../../events/collection';
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
        return 'Já existe um vôo agendado para essa aeronave nesta data e hora.';
      }

      // Check Maintenance
      const maintenanceEvents = await EventsCollection.find({
        type: 'Maintenance',
        'airplane.value': airplaneId,
        start: { $lte: dateToCheck },
        end: { $gte: dateToCheck },
      }).fetchAsync();

      if (maintenanceEvents.length > 0) {
        return 'A aeronave estará em manutenção nesta data e hora.';
      }
    }
    return null;
  },
});
