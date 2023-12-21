import React from 'react';
import { Box, Tooltip, Stack, Button } from '@mui/material';
import { Edit, Cancel, AssignmentTurnedIn, AccessTime, EventNote } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useLoggedUser } from 'meteor/quave:logged-user-react';
import { Flight } from '/imports/api/flights/collection';
import { authorize } from '/imports/api/flights/methods/authorize';
import { update } from '/imports/api/flights/methods/update';
import { Meteor } from 'meteor/meteor';
import useHasPermission from '../../shared/hooks/useHasPermission';

interface FlightDetailsStatusButtonsProps {
  readonly flight: Flight;
  readonly onEdit: (flightId: string) => void;
}

const FlightDetailsStatusButtons = ({ flight, onEdit }: FlightDetailsStatusButtonsProps) => {
  const [_canUpdateLoading, canUpdate] = useHasPermission('flights.update');
  const [_canRemoveLoading, canCancel] = useHasPermission('flights.cancel');
  const { enqueueSnackbar } = useSnackbar();
  const { loggedUser } = useLoggedUser();
  const isCancelled = flight.cancelled;
  const canAuthorize =
    !loggedUser || !flight.authorizer ? false : loggedUser._id === flight.authorizer.value;

  const handleCancel = async () => {
    if (!canUpdate || isCancelled) return;
    try {
      // await cancel({ flightId: flight._id, cancelled: true });
      // enqueueSnackbar('Vôo cancelado com sucesso.', {
      //   variant: 'success',
      //   action: () => (
      //     <Button
      //       color="inherit"
      //       size="small"
      //       onClick={async () => {
      //         try {
      //           await cancel({ flightId: flight._id, cancelled: false });
      //           enqueueSnackbar('Vôo não cancelado.');
      //         } catch (e: unknown) {
      //           console.log(e);
      //           if (e instanceof Meteor.Error) {
      //             enqueueSnackbar(e.message, { variant: 'error' });
      //           }
      //         }
      //       }}
      //     >
      //       Desfazer
      //     </Button>
      //   ),
      // });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleAuthorize = async () => {
    if (!canAuthorize || isCancelled) return;
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
    if (!canUpdate || isCancelled) return;
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
    flight && (
      <Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title={flight.dateConfirmed ? 'Data Confirmada' : 'Data Prevista'}>
            <EventNote
              onClick={(e) => {
                e.stopPropagation();
                handleToggleProperty('dateConfirmed', !flight.dateConfirmed);
              }}
              sx={{ cursor: isCancelled || !canUpdate ? 'not-allowed' : 'pointer' }}
              color={isCancelled ? 'disabled' : flight.dateConfirmed ? 'success' : 'warning'}
            />
          </Tooltip>
          <Tooltip title={flight.timeConfirmed ? 'Horário Confirmado' : 'Horário Previsto'}>
            <AccessTime
              onClick={(e) => {
                e.stopPropagation();
                handleToggleProperty('timeConfirmed', !flight.timeConfirmed);
              }}
              sx={{ cursor: isCancelled || !canUpdate ? 'not-allowed' : 'pointer' }}
              color={isCancelled ? 'disabled' : flight.timeConfirmed ? 'success' : 'warning'}
            />
          </Tooltip>
          <Tooltip title={flight.authorized ? 'Autorizado' : 'Pendente de autorização'}>
            <AssignmentTurnedIn
              onClick={(e) => {
                e.stopPropagation();
                handleAuthorize();
              }}
              sx={{ cursor: isCancelled || !canAuthorize ? 'not-allowed' : 'pointer' }}
              color={isCancelled ? 'disabled' : flight.authorized ? 'success' : 'warning'}
            />
          </Tooltip>
          {canUpdate && (
            <Tooltip title="Editar">
              <Edit
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCancelled) return;
                  onEdit(flight._id);
                }}
                sx={{ cursor: isCancelled ? 'not-allowed' : 'pointer' }}
                color={isCancelled ? 'disabled' : 'primary'}
              />
            </Tooltip>
          )}
          {canCancel && (
            <Tooltip title="Cancelar">
              <Cancel
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                sx={{ cursor: isCancelled ? 'not-allowed' : 'pointer' }}
                color={isCancelled ? 'disabled' : 'error'}
              />
            </Tooltip>
          )}
        </Stack>
      </Box>
    )
  );
};

export default FlightDetailsStatusButtons;
