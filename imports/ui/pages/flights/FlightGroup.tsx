import { Box } from '@mui/material';
import React from 'react';
import { Flight } from '/imports/api/flights/collection';

interface FlightGroupProps {
  readonly flights: Flight[];
}

const FlightGroup = ({ flights }: FlightGroupProps) => {
  const airplane = flights[0].airplane.label;
  const departureDateTime = flights[0].scheduledDepartureDateTime;
  const arrivalDateTime = flights[flights.length - 1].scheduledArrivalDateTime;
  const legs = [flights[0].origin.label, ...flights.map((m) => m.destination.label)];
  return (
    <Box>
      <>
        {airplane}
        {departureDateTime}
        {arrivalDateTime}
        {legs.join(' -> ')}
      </>
    </Box>
  );
};

export default FlightGroup;
