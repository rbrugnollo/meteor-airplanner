import React from 'react';
import { Box, Grid, Stack } from '@mui/material';
import { Flight } from '/imports/api/flights/collection';

interface FlightDetailsExtraInfoProps {
  readonly flight: Flight;
}

const fontSizeStyle = { fontSize: { xs: '12px', md: '13px' } };

const FlightDetailsExtraInfo = ({ flight }: FlightDetailsExtraInfoProps) => {
  return (
    flight && (
      <Grid container spacing={3} columns={24} alignItems="center">
        <Grid item>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={0.5}>
              <Box sx={{ fontWeight: 500 }}>Comandante:</Box>
              <span>{flight.captain?.label}</span>
            </Stack>
          </Box>
        </Grid>
        <Grid item>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={0.5}>
              <Box sx={{ fontWeight: 500 }}>Co-Piloto:</Box>
              <span>{flight.firstOfficer?.label}</span>
            </Stack>
          </Box>
        </Grid>
        <Grid item>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={0.5}>
              <Box sx={{ fontWeight: 500 }}>
                {flight.authorized ? 'Autorizado por:' : 'Aguardando autorização de:'}
              </Box>
              <span>{flight.authorizer?.label}</span>
            </Stack>
          </Box>
        </Grid>
      </Grid>
    )
  );
};

export default FlightDetailsExtraInfo;
