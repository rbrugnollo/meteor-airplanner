/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { defaultHeaders } from './greatCircleMapper';
import cachedFetch from '../apiCache/apiCache';

interface AircraftInfo {
  name: string;
  manufacturer: string;
  type: string;
  iata_code: string;
  icao_code: string;
  passengers: string;
  speed_kmh: string;
  speed_kts: string;
  ceiling_m: string;
  ceiling_ft: string;
  range_km: string;
  range_nm: string;
  mtow_kg: string;
  mtow_lbs: string;
  alias: string;
}

export const fetchAircraftInfo = async (icaoCode: string) => {
  const { baseUrl } = Meteor.settings.private.greatCircleMapper;
  const result = await cachedFetch<AircraftInfo>(`${baseUrl}/aircraft/read/${icaoCode}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  return result;
};
