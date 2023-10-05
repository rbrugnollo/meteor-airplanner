/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { fetch } from 'meteor/fetch';

interface PositionResultAircraft {
  hex: string;
  type: string;
  flight?: string;
  r: string;
  t: string;
  alt_baro: number | 'ground';
  alt_geom?: number;
  gs: number;
  track: number;
  baro_rate: number;
  squawk: string;
  category?: string;
  nav_qnh?: number;
  lat: number;
  lon: number;
  nic: number;
  rc: number;
  seen_pos: number;
  version: number;
  nic_baro?: number;
  nac_p?: number;
  nac_v?: number;
  sil?: number;
  sil_type?: string;
  gva?: number;
  sda?: number;
  alert?: number;
  spi?: number;
  messages: number;
  seen: number;
  rssi: number;
  now: number;
  ctime: number;
}

interface PositionResult {
  ac: PositionResultAircraft[];
  msg: string;
  total: number;
  now: number;
  ctime: number;
  ptime: number;
}

export const fetchPositionByRegistrations = async (registrations: string[]) => {
  const { baseUrl, apiKey } = Meteor.settings.private.adsbExchange;
  const result = await fetch(`${baseUrl}/registration/${registrations.join(',')}/`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
    },
  });

  const json = (await result.json()) as PositionResult;
  return json;
};
