import React from 'react';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Tooltip,
  Button,
  Grid,
  IconButton,
  Stack,
  Chip,
  Badge,
} from '@mui/material';
import {
  AssignmentTurnedIn,
  NavigateNext,
  AccessTime,
  EventNote,
  Edit,
  Cancel,
  Map,
  BuildOutlined,
  Flight as FlightIcon,
} from '@mui/icons-material';
import { Flight } from '/imports/api/flights/collection';
import { cancel } from '/imports/api/flights/methods/cancel';
import { Meteor } from 'meteor/meteor';
import { authorize } from '/imports/api/flights/methods/authorize';
import { update } from '/imports/api/flights/methods/update';

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
  const { loggedUser } = useLoggedUser();

  const handleCancel = async () => {
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

  const handleAuthorize = async () => {
    const canAuthorize =
      !loggedUser || !flight.authorizer ? false : loggedUser._id === flight.authorizer.value;
    if (!canAuthorize) return;
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

  const handleToggleProperty = async (propName: string, value: boolean) => {
    if (!canUpdate) return;
    try {
      const previousValue = !value;
      await update({
        ...flight,
        [propName]: !previousValue,
      });
      enqueueSnackbar('Vôo atualizado com sucesso.', {
        variant: 'success',
        action: () => (
          <Button
            color="inherit"
            size="small"
            onClick={async () => {
              try {
                await update({
                  ...flight,
                  [propName]: previousValue,
                });
                enqueueSnackbar('Atualizações revertidas.');
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
    <Accordion>
      <AccordionSummary>
        <Grid container spacing={2} columns={24} alignItems="center">
          <Grid item xs={12} md={3}>
            <Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title={flight.dateConfirmed ? 'Data Confirmada' : 'Data Prevista'}>
                  <EventNote
                    onClick={() => {
                      handleToggleProperty('dateConfirmed', !flight.dateConfirmed);
                    }}
                    color={flight.dateConfirmed ? 'success' : 'warning'}
                  />
                </Tooltip>
                <Tooltip title={flight.timeConfirmed ? 'Horário Confirmado' : 'Horário Previsto'}>
                  <AccessTime
                    onClick={() => handleToggleProperty('timeConfirmed', !flight.timeConfirmed)}
                    color={flight.timeConfirmed ? 'success' : 'warning'}
                  />
                </Tooltip>
                <Tooltip title={flight.authorized ? 'Autorizado' : 'Pendente de autorização'}>
                  <AssignmentTurnedIn
                    onClick={handleAuthorize}
                    color={flight.authorized ? 'success' : 'warning'}
                  />
                </Tooltip>
                {canUpdate && (
                  <Tooltip title="Editar">
                    <Edit onClick={() => onEdit(flight._id)} color="primary" />
                  </Tooltip>
                )}
                {canCancel && (
                  <Tooltip title="Cancelar">
                    <Cancel onClick={handleCancel} color="error" />
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                color="info"
                label={dayjs(flight.scheduledDepartureDateTime).format('ddd, DD/MM HH:mm')}
              />
              {flight.maintenance ? (
                <Tooltip title="Vôo de Manutenção">
                  <BuildOutlined />
                </Tooltip>
              ) : null}
            </Stack>
          </Grid>
          <Grid item xs={24} md={5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <FlightIcon fontSize="small" />
              <b>{flight.airplane?.label}</b>
            </Stack>
          </Grid>
          <Grid item xs={24} md={13} alignItems="center">
            <Stack direction="row" alignItems="center" spacing={0.2}>
              <span>{flight.origin?.label}</span>
              <NavigateNext />
              <span>{flight.destination?.label}</span>
              <Tooltip title="Visualizar Rota">
                <IconButton onClick={() => onViewRoute(flight.groupId)}>
                  <Map />
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          <Grid item>
            <b>Comandante:</b> {flight.captain?.label}
          </Grid>
          <Grid item>
            <b>Co-Piloto:</b> {flight.firstOfficer?.label}
          </Grid>
          <Grid item>
            <Badge color="info" badgeContent={flight.passengers?.length ?? 0}>
              <b>Passageiros:</b>
            </Badge>
            &nbsp;{flight.passengers?.map((m) => m.label).join(', ') ?? ''}
          </Grid>
          <Grid item>
            <b>Solicitantes:</b> {flight.requesters?.map((m) => m.requester?.label).join(', ')}
          </Grid>
          <Grid item>
            <b>Centros de Custo:</b>{' '}
            {flight.requesters?.map((m) => `${m.costCenter?.label} ${m.percentage}%`).join(', ')}
          </Grid>
          <Grid item>
            <b>{flight.authorized ? 'Autorizado por ' : 'Aguardando autorização de '}</b>
            {flight.authorizer?.label}
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
};

export default FlightDetails;
