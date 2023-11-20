import { createMethod } from 'meteor/zodern:relay';
import { z } from 'zod';
import { fetchAircraftInfo } from '/imports/server/clients/greatCircleMapper/fetchAircraftInfo';

export const validateIcaoCode = createMethod({
  name: 'airplanes.validateIcaoCode',
  schema: z.object({ icaoCode: z.string() }),
  async run({ icaoCode }) {
    if (!icaoCode) return null;

    const result = await fetchAircraftInfo(icaoCode);
    if (!result || 'error' in result) {
      return result.error ?? 'Código ICAO inválido';
    }

    return null;
  },
});
