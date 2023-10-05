import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { fetchPositionByRegistrations } from '/imports/server/clients/adsbExchange/adsbExchange';
import { AirplanePosition, AirplanesCollection } from '../collection';

export const fetchPositions = createMethod({
  name: 'airplanes.fetchPositions',
  schema: z.undefined(),
  async run() {
    const airplanes = await AirplanesCollection.find().fetchAsync();
    const tailNumbers = airplanes.map((airplane) => airplane.tailNumber);
    const result = await fetchPositionByRegistrations(tailNumbers);
    airplanes.forEach((airplane) => {
      const ac = result.ac.find((ac) => airplane.tailNumber === ac.r);
      const position: AirplanePosition = ac
        ? {
            updatedAt: new Date(),
            isFlying: true,
            details: {
              flightNumber: ac.flight?.trim() ?? '',
              barometricAltitude: ac.alt_baro,
              geometricAltitute: ac.alt_geom,
              groundSpeed: ac.gs,
              squawk: ac.squawk,
              lat: ac.lat,
              lon: ac.lon,
            },
          }
        : {
            updatedAt: new Date(),
            isFlying: false,
            details: null,
          };
      AirplanesCollection.updateAsync(airplane._id, {
        $set: {
          position,
        },
      });
    });
  },
});
