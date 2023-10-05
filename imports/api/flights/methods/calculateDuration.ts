import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { AirplanesCollection } from '../../airplanes/collection';
import { AirportsCollection } from '../../airports/collection';
import { calculateDistanceAndFlightTime } from '/imports/server/clients/greatCircleMapper/calculateDistanceAndFlightTime';

export const calculateDuration = createMethod({
  name: 'flights.calculateDuration',
  schema: z.object({
    originAirportId: z.string(),
    destinationAirportId: z.string(),
    airplaneId: z.string(),
  }),
  async run({ originAirportId, destinationAirportId, airplaneId }) {
    const airplane = await AirplanesCollection.findOneAsync(airplaneId, { fields: { info: 1 } });
    const originAirport = await AirportsCollection.findOneAsync(originAirportId, {
      fields: { icao: 1 },
    });
    const destinationAirport = await AirportsCollection.findOneAsync(destinationAirportId, {
      fields: { icao: 1 },
    });

    const speedKts = airplane?.info?.speedKts;
    const originIcaoCode = originAirport?.icao;
    const destinationIcaoCode = destinationAirport?.icao;

    if (!speedKts || !originIcaoCode || !destinationIcaoCode) return null;

    const result = await calculateDistanceAndFlightTime(
      originIcaoCode,
      destinationIcaoCode,
      speedKts,
    );

    if (!result) return null;

    const { flight_time_min: flightTimeMin } = result.totals;

    const hours = Math.floor(flightTimeMin / 60);
    const minutes = Math.ceil(flightTimeMin % 60);
    const duration = `${hours}:${minutes}`;
    return duration;
  },
});
