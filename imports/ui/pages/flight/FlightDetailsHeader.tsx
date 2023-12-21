import React from 'react';
import { Box, Tooltip, Grid, IconButton, Stack, Typography } from '@mui/material';
import {
  NavigateNext,
  People,
  FlightTakeoff,
  FlightLand,
  Map,
  Build,
  LocalAtm,
  PlaylistAddCheck,
  Flight as FlightIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { Flight } from '/imports/api/flights/collection';
import FlightDetailsStatusButtons from './FlightStatusButtons';

interface FlightDetailsHeaderProps {
  readonly flight: Flight;
  readonly onEdit: (flightId: string) => void;
  readonly onViewRoute: (flightGroupId: string) => void;
}

const iconStyle = { fontSize: '19px' };
const fontSizeStyle = { fontSize: { xs: '12px', md: '13px' } };

const FlightDetailsHeader = ({ flight, onEdit }: FlightDetailsHeaderProps) => {
  return (
    flight && (
      <Grid container spacing={2} columns={24} alignItems="center">
        <Grid item xs={12} md={4}>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Typography
                variant="h6"
                sx={{ fontSize: { xs: '12px', md: '14px' }, color: 'primary.main' }}
              >
                {dayjs(flight.scheduledDepartureDateTime).format('ddd, DD/MM')}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <FlightTakeoff sx={iconStyle} />
                <span>{dayjs(flight.scheduledDepartureDateTime).format('HH:mm')}</span>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                <FlightLand sx={iconStyle} />
                <span>{dayjs(flight.scheduledArrivalDateTime).format('HH:mm')}</span>
              </Stack>
              <Tooltip title="Vôo de Manutenção">
                <Build sx={{ fontSize: '17px' }} color="warning" />
              </Tooltip>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={24} md={5} alignItems="center">
          <Stack sx={fontSizeStyle} direction="row" alignItems="center" spacing={0.2}>
            <span>{flight.origin?.label}</span>
            <NavigateNext />
            <span>{flight.destination?.label}</span>
            <Tooltip title="Visualizar Rota">
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Map />
              </IconButton>
            </Tooltip>
          </Stack>
        </Grid>
        <Grid item xs={24} md={4}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <FlightIcon fontSize="small" />
            <Typography sx={{ fontWeight: 700, ...fontSizeStyle }} variant="body2">
              {flight.airplane?.label}
            </Typography>
            <Box sx={{ paddingLeft: 1, ...fontSizeStyle }}>
              <Stack direction="row" spacing={0.5}>
                <People sx={iconStyle} />
                <span>{flight.passengers?.length ?? 0}</span>
              </Stack>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={24} md={3}>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={0.5}>
              <PlaylistAddCheck sx={iconStyle} />
              <span>{flight.createdByLabel}</span>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={24} md={5}>
          <Box sx={fontSizeStyle}>
            <Stack direction="row" spacing={0.5}>
              <LocalAtm sx={iconStyle} />
              <span>
                {flight.requesters
                  ?.map((m) => `${m.costCenter?.label} - ${m.requester?.label}`)
                  .join(', ')}
              </span>
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={24} md={3}>
          <FlightDetailsStatusButtons onEdit={onEdit} flight={flight} />
        </Grid>
      </Grid>
    )
  );
};

export default FlightDetailsHeader;
