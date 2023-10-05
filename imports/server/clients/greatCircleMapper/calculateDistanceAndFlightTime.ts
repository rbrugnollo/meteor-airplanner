/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { fetch } from 'meteor/fetch';
import { defaultHeaders } from './greatCircleMapper';

export interface RouteLegAirport {
  id: string;
  ident: string;
  name: string;
  elevation_ft: string;
  icao_code: string;
  iata_code: string;
  alias: string;
  latitude_deg: string;
  longitude_deg: string;
  latitude_minsec: string;
  longitude_minsec: string;
  link: string;
}

export interface RouteLeg {
  origin: RouteLegAirport;
  destination: RouteLegAirport;
  distance_km: number;
  distance_nm: number;
  flight_time_min: number;
  heading_deg: number;
  heading_compass: string;
}

export interface Route {
  totals: {
    distance_km: number;
    distance_nm: number;
    flight_time_min: number;
    speed_kmh: number;
    speed_kts: string;
  };
  legs: RouteLeg[];
}

export const calculateDistanceAndFlightTime = async (
  originIcaoCode: string,
  destinationIcaoCode: string,
  speedKts: string,
) => {
  const { baseUrl } = Meteor.settings.private.greatCircleMapper;
  const result = await fetch(
    `${baseUrl}/airports/route/${originIcaoCode}-${destinationIcaoCode}/${speedKts}`,
    {
      method: 'GET',
      headers: defaultHeaders,
    },
  );

  const json = (await result.json()) as Route;
  return json;
};
