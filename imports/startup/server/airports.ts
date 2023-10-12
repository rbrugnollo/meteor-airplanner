import { readFileSync } from 'fs';
import { AirportsCollection } from '/imports/api/airports/collection';
import { find } from 'geo-tz';

interface AirportJson {
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly IATA: string;
  readonly ICAO: string;
  readonly lat: string;
  readonly lon: string;
  readonly timezone: string;
}

export const AirplanesStartup = () => {
  if (AirportsCollection.find().count() === 0) {
    const fileContent = readFileSync('assets/app/files/airports.json', 'utf-8');
    const airports = JSON.parse(fileContent);
    airports.forEach((airport: AirportJson) => {
      const timezoneName = find(parseFloat(airport.lat), parseFloat(airport.lon))[0];
      AirportsCollection.insert({
        name: airport.name,
        city: airport.city,
        country: airport.country,
        iata: airport.IATA,
        icao: airport.ICAO,
        lat: airport.lat,
        lon: airport.lon,
        timezone: airport.timezone,
        timezoneName,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'startup',
        updatedBy: 'startup',
      });
    });
  }
};
