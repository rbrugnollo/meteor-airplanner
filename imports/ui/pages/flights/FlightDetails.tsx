import React from 'react';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { Box, Tooltip, Button, Grid, IconButton, Stack } from '@mui/material';
import { Warning, Check, DoneAll, CheckCircleOutline, Edit, Cancel } from '@mui/icons-material';
import { FaRoute, FaArrowRight, FaPlaneDeparture, FaPlaneArrival, FaClock } from 'react-icons/fa6';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';
import { PiNumberCircleThreeFill, PiNumberCircleTwoFill } from 'react-icons/pi';
import { Flight } from '/imports/api/flights/collection';
import { cancel } from '/imports/api/flights/methods/cancel';
import { Meteor } from 'meteor/meteor';
import { authorize } from '/imports/api/flights/methods/authorize';

interface FlightDetailsProps {
  readonly flight: Flight;
  readonly canUpdate: boolean;
  readonly canCancel: boolean;
  readonly onEdit: (flightId: string) => void;
  readonly onViewRoute: (flightGroupId: string) => void;
}

const FlightDetails = ({
  flight,
  canUpdate,
  canCancel,
  onEdit,
  onViewRoute,
}: FlightDetailsProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const handleCancel = async () => {
    async () => {
      try {
        await cancel({ flightId: flight._id, cancelled: true });
        enqueueSnackbar('Vôo cancelado com sucesso.', {
          variant: 'success',
          action: () => (
            <Button
              color="inherit"
              size="small"
              onClick={async () => {
                try {
                  await cancel({ flightId: flight._id, cancelled: false });
                  enqueueSnackbar('Vôo não cancelado.');
                } catch (e: unknown) {
                  console.log(e);
                  if (e instanceof Meteor.Error) {
                    enqueueSnackbar(e.message, { variant: 'error' });
                  }
                }
              }}
            >
              Desfazer
            </Button>
          ),
        });
      } catch (e: unknown) {
        console.log(e);
        if (e instanceof Meteor.Error) {
          enqueueSnackbar(e.message, { variant: 'error' });
        }
      }
    };
  };

  const handleAuthorize = async () => {
    try {
      await authorize({ flightId: flight._id, authorized: true });
      enqueueSnackbar('Vôo autorizado com sucesso.', {
        variant: 'success',
        action: () => (
          <Button
            color="inherit"
            size="small"
            onClick={async () => {
              try {
                await authorize({ flightId: flight._id, authorized: false });
                enqueueSnackbar('Vôo não autorizado.');
              } catch (e: unknown) {
                console.log(e);
                if (e instanceof Meteor.Error) {
                  enqueueSnackbar(e.message, { variant: 'error' });
                }
              }
            }}
          >
            Desfazer
          </Button>
        ),
      });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
      }}
    >
      <Grid container>
        <Grid item xs={5}>
          {flight.timeConfirmed ? (
            <Tooltip title="Data e Hora Confirmados">
              <DoneAll color="success" />
            </Tooltip>
          ) : flight.dateConfirmed ? (
            <Tooltip title="Data Confirmada">
              <IconButton onClick={handleCancel}>
                <Check color="warning" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Data e Hora a confirmar">
              <Warning color="warning" />
            </Tooltip>
          )}
          <FaPlaneDeparture />
          {dayjs(flight.scheduledDepartureDateTime).format('ddd, DD/MM HH:mm')}
          <FaPlaneArrival />
          {dayjs(flight.scheduledArrivalDateTime).format('ddd, DD/MM HH:mm')}
          <FaClock />
          {flight.estimatedDuration}
        </Grid>
        <Grid item xs={5}>
          {flight.origin?.label} <FaArrowRight /> {flight.destination?.label}{' '}
          <Tooltip title="Visualizar Rota">
            <IconButton onClick={() => onViewRoute(flight.groupId)}>
              <FaRoute />
            </IconButton>
          </Tooltip>
        </Grid>
        <Grid item xs={2}>
          {flight.airplane?.label}
        </Grid>
        <Grid item xs={6}>
          {flight.createdByName} - <PiNumberCircleThreeFill />
          {flight.captain?.label} <PiNumberCircleTwoFill />
          {flight.firstOfficer?.label}
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" spacing={1}>
            {canUpdate && (
              <Tooltip title="Editar">
                <IconButton onClick={() => onEdit(flight._id)}>
                  <Edit color="primary" />
                </IconButton>
              </Tooltip>
            )}
            {canCancel && (
              <Tooltip title="Cancelar">
                <IconButton onClick={handleCancel}>
                  <Cancel color="error" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <MdAirlineSeatReclineNormal /> {flight.passengers?.length ?? 0}{' '}
          {flight.passengers?.map((m) => m.label).join(', ')}
        </Grid>

        <Grid item xs={6}>
          Solicitantes: {flight.requesters?.map((m) => m.requester?.label).join(', ')}
        </Grid>
        <Grid item xs={6}>
          Centros de Custo:{' '}
          {flight.requesters?.map((m) => `${m.costCenter?.label} ${m.percentage}%`).join(', ')}
        </Grid>
        <Grid item xs={6}>
          {flight.authorized ? 'Autorizado por ' : 'Aguardando autorização de '}
          {flight.authorizer?.label}
          <Tooltip title="Autorizar">
            <IconButton onClick={handleAuthorize}>
              <CheckCircleOutline color="success" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FlightDetails;
