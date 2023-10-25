import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { fetchAircraftInfo } from '/imports/server/clients/greatCircleMapper/fetchAircraftInfo';
import { AirplanesCollection } from '../collection';

export const updateInfo = createMethod({
  name: 'airplanes.updateInfo',
  schema: z.object({ _id: z.string() }),
  async run({ _id }) {
    const airplane = await AirplanesCollection.findOneAsync(_id);
    if (airplane?.icaoCode && airplane?.info?.icaoCode !== airplane?.icaoCode) {
      const result = await fetchAircraftInfo(airplane.icaoCode);
      if (!result || 'error' in result) {
        AirplanesCollection.updateAsync(airplane._id, {
          $set: {
            info: null,
          },
        });
      } else {
        AirplanesCollection.updateAsync(airplane._id, {
          $set: {
            info: {
              name: result.name,
              manufacturer: result.manufacturer,
              passengers: result.passengers,
              type: result.type,
              alias: result.alias,
              iataCode: result.iata_code,
              icaoCode: result.icao_code,
              speedKmh: result.speed_kmh,
              speedKts: result.speed_kts,
              ceilingMeters: result.ceiling_m,
              ceilingFeet: result.ceiling_ft,
              rangeKm: result.range_km,
              rangeNm: result.range_nm,
              mtowKg: result.mtow_kg,
              mtowLbs: result.mtow_lbs,
            },
          },
        });
      }
    }
  },
});
