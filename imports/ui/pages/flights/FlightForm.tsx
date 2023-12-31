import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  Theme,
  TextField,
  IconButton,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  Divider,
  Checkbox,
} from '@mui/material';
import {
  FormikErrors,
  useFormik,
  FormikProvider,
  FieldArray,
  getIn,
  setNestedObjectValues,
} from 'formik';
import { insert } from '/imports/api/flights/methods/insert';
import { update } from '/imports/api/flights/methods/update';
import { useSnackbar } from 'notistack';
import { Flight, FlightRequester, FlightsCollection } from '/imports/api/flights/collection';
import { Meteor } from 'meteor/meteor';
import { IdBaseCollectionTypes, Nullable } from '/imports/api/common/BaseCollection';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { getOne as getOneAirplane } from '/imports/api/airplanes/methods/getOne';
import { getOne as getOneAirport } from '/imports/api/airports/methods/getOne';
import dayjs from 'dayjs';
import AirplaneSelect from '../../shared/selects/AirplaneSelect';
import AirportSelect from '../../shared/selects/AirportSelect';
import UserSelect from '../../shared/selects/UserSelect';
import { Airplane } from '/imports/api/airplanes/collection';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import createUuid from '../../shared/functions/createUuid';
import { list } from '/imports/api/flights/publications/list';
import { calculateDuration } from '/imports/api/flights/methods/calculateDuration';
import { Airport } from '/imports/api/airports/collection';
import { checkAvailability } from '/imports/api/airplanes/methods/checkAvailability';
import { checkLocation } from '/imports/api/airplanes/methods/checkLocation';
import { checkPilotAvailability } from '/imports/api/users/methods/checkPilotAvailability';
import CostCenterSelect from '../../shared/selects/CostCenterSelect';
import { sum } from 'lodash';

type FlightFormValues = Nullable<Omit<Flight, IdBaseCollectionTypes>>;

interface FlightFormProps {
  readonly flightId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const FlightForm = ({ flightId, open, onClose }: FlightFormProps) => {
  const [airplane, setAirplane] = useState<Airplane | undefined>(undefined);
  const [origin, setOrigin] = useState<Airport | undefined>(undefined);
  const [lastSavedFlight, setLastSavedFlight] = useState<Flight | undefined>(undefined);
  const [destination, setDestination] = useState<Airport | undefined>(undefined);
  const [calculatingDuration, setCalculatingDuration] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<FlightFormValues>({
    initialValues: {
      _id: null,
      groupId: null,
      airplane: null,
      scheduledDepartureDateTime: null,
      scheduledArrivalDateTime: null,
      estimatedDuration: '',
      estimatedHandlingDuration: '00:30',
      estimatedDistanceKm: null,
      estimatedDistanceNm: null,
      origin: null,
      destination: null,
      maintenance: false,
      published: false,
      dateConfirmed: false,
      timeConfirmed: false,
      authorizer: null,
      authorized: false,
      cancelled: false,
      captain: null,
      captainInReserve: true,
      firstOfficer: null,
      firstOfficerInReserve: true,
      passengers: [],
      requesters: [],
      notes: '',
      createdByLabel: null,
      updatedByLabel: null,
    },
    validate: async (values) => {
      let errors: FormikErrors<FlightFormValues> = {};

      // Validate airplane seats
      if (airplane && (values.passengers?.length ?? 0) > airplane.seats) {
        errors = {
          ...errors,
          passengers: `Limite máximo de ${airplane.seats} passageiros.`,
        };
      }
      // Validate availability
      if (values.scheduledDepartureDateTime && values.scheduledArrivalDateTime) {
        // Validate airplane availability
        if (values.airplane) {
          const airplaneAvailabilityErrors = await checkAvailability({
            flightId: values._id ?? '',
            airplaneId: values.airplane.value,
            dates: [values.scheduledDepartureDateTime, values.scheduledArrivalDateTime],
          });
          if (airplaneAvailabilityErrors) {
            errors = {
              ...errors,
              scheduledDepartureDateTime: airplaneAvailabilityErrors,
            };
          }
        }
        // Validate captain availability
        if (values.captain) {
          const availabilityErrors = await checkPilotAvailability({
            flightId: values._id ?? '',
            userId: values.captain.value,
            dates: [values.scheduledDepartureDateTime, values.scheduledArrivalDateTime],
          });
          if (availabilityErrors) {
            errors = {
              ...errors,
              captain: availabilityErrors,
            };
          }
        }
        // Validate firstOfficer availability
        if (values.firstOfficer) {
          const availabilityErrors = await checkPilotAvailability({
            flightId: values._id ?? '',
            userId: values.firstOfficer.value,
            dates: [values.scheduledDepartureDateTime, values.scheduledArrivalDateTime],
          });
          if (availabilityErrors) {
            errors = {
              ...errors,
              firstOfficer: availabilityErrors,
            };
          }
        }
      }

      // Validate airplane location
      if (values.airplane && values.origin && values.scheduledDepartureDateTime) {
        const airplaneLocationErrors = await checkLocation({
          flightId: values._id ?? '',
          airplaneId: values.airplane.value,
          airportId: values.origin.value,
          dateToCheck: values.scheduledDepartureDateTime,
        });
        if (airplaneLocationErrors) {
          errors = {
            ...errors,
            origin: airplaneLocationErrors,
          };
        }
      }

      return errors;
    },
    validationSchema: Yup.object<FlightFormValues>().shape({
      airplane: Yup.object().required('Aeronave é obrigatório'),
      scheduledDepartureDateTime: Yup.date().required('Data e Hora é obrigatório'),
      estimatedDuration: Yup.string()
        .required('Tempo de vôo é obrigatório')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Formato inválido (hh:mm)'),
      estimatedHandlingDuration: Yup.string()
        .required('Handling é obrigatório')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Formato inválido (hh:mm)'),
      origin: Yup.object().required('Origem é obrigatório'),
      destination: Yup.object().required('Destino é obrigatório'),
      requesters: Yup.array().of(
        Yup.object().shape({
          requester: Yup.object().required('Solicitante é obrigatório'),
          costCenter: Yup.object().required('Centro de Custo é obrigatório'),
          percentage: Yup.number()
            .required('Porcentagem é obrigatório')
            .test('sum', 'Soma deve ser 100%', function (_v) {
              const values = this.from?.[1]?.value as FlightFormValues;
              if (!values || !values.requesters) return true;
              const totalPercentage = sum(values.requesters.map((m) => m.percentage ?? 0));
              return totalPercentage > 99 && totalPercentage < 101;
            }),
        }),
      ),
    }),
    onSubmit: handleSaveAndClose,
    enableReinitialize: true,
  });

  useSubscribe(() => {
    return list({
      andFilters: [
        { groupId: formik.values.groupId ?? '' },
        { _id: { $ne: formik.values._id ?? '' } },
      ],
      options: {},
    });
  });

  const groupFlights = useFind(
    () =>
      FlightsCollection.find(
        {
          $and: [
            { groupId: formik.values.groupId ?? '' },
            { _id: { $ne: formik.values._id ?? '' } },
          ],
        },
        {},
      ),
    [formik.values.groupId],
  );

  useEffect(() => {
    formik.resetForm();
    if (!open) return;
    if (flightId) {
      const flight = FlightsCollection.findOne(flightId);
      setLastSavedFlight(flight);
      if (flight) formik.setValues(flight);
    } else {
      formik.setFieldValue('groupId', createUuid());
      setLastSavedFlight(undefined);
    }
  }, [open]);

  useEffect(() => {
    formik.setFieldValue('estimatedDuration', '');
    if (formik.values.origin && formik.values.destination && formik.values.airplane) {
      setCalculatingDuration(true);
      calculateDuration({
        originAirportId: formik.values.origin.value,
        destinationAirportId: formik.values.destination.value,
        airplaneId: formik.values.airplane.value,
      })
        .then((d) => d)
        .then((result) => {
          if (result?.duration) {
            formik.setFieldValue('estimatedDuration', result?.duration ?? '');
            formik.setFieldValue('estimatedDistanceNm', result?.distanceNm ?? null);
            formik.setFieldValue('estimatedDistanceKm', result?.distanceKm ?? null);
          }
        })
        .finally(() => {
          setCalculatingDuration(false);
        });
    }
  }, [formik.values.origin, formik.values.destination, formik.values.airplane]);

  useEffect(() => {
    setScheduledArrivalDateTime();
  }, [
    destination,
    formik.values.scheduledDepartureDateTime,
    formik.values.estimatedDuration,
    formik.values.estimatedHandlingDuration,
  ]);

  useEffect(() => {
    setAirplane(undefined);
    if (formik.values.airplane) {
      getOneAirplane({ _id: formik.values.airplane.value })
        .then((a) => a)
        .then((airplane) => {
          if (airplane) {
            setAirplane(airplane);
            formik.setFieldValue('authorizer', airplane.manager);
            formik.setFieldValue('captain', airplane.captain);
            formik.setFieldValue('firstOfficer', airplane.firstOfficer);
          }
        });
    }
  }, [formik.values.airplane]);

  useEffect(() => {
    setOrigin(undefined);
    if (formik.values.origin) {
      getOneAirport({ _id: formik.values.origin.value })
        .then((a) => a)
        .then((airport) => {
          if (airport) {
            setOrigin(airport);
          }
        });
    }
  }, [formik.values.origin]);

  useEffect(() => {
    setDestination(undefined);
    if (formik.values.destination) {
      getOneAirport({ _id: formik.values.destination.value })
        .then((a) => a)
        .then((airport) => {
          if (airport) {
            setDestination(airport);
          }
        });
    }
  }, [formik.values.destination]);

  function setScheduledArrivalDateTime() {
    formik.setFieldValue('scheduledArrivalDateTime', '');
    const { scheduledDepartureDateTime, estimatedDuration } = formik.values;
    if (scheduledDepartureDateTime && estimatedDuration) {
      const arrival = dayjs(scheduledDepartureDateTime)
        .add(parseInt(estimatedDuration.split(':')[0]), 'hour')
        .add(parseInt(estimatedDuration.split(':')[1]), 'minute')
        .tz(destination?.timezoneName ?? 'UTC')
        .toDate();
      formik.setFieldValue('scheduledArrivalDateTime', arrival);
    }
  }

  function setNextScheduledDepartureDateTime() {
    formik.setFieldValue('scheduledArrivalDateTime', '');
    const { scheduledArrivalDateTime, estimatedHandlingDuration } = formik.values;
    if (scheduledArrivalDateTime && estimatedHandlingDuration) {
      const departure = dayjs(scheduledArrivalDateTime)
        .add(parseInt(estimatedHandlingDuration.split(':')[0]), 'hour')
        .add(parseInt(estimatedHandlingDuration.split(':')[1]), 'minute')
        .tz(destination?.timezoneName ?? 'UTC')
        .toDate();
      formik.setFieldValue('scheduledDepartureDateTime', departure);
    }
  }

  function goToNextFlight(createdAtAfter: Date) {
    // If there's a following flight for the groupId, load it
    // otherwise, start a new flight
    const followingFlight = FlightsCollection.findOne(
      {
        groupId: formik.values.groupId ?? '',
        createdAt: { $gt: createdAtAfter },
      },
      { sort: { createdAt: 1 } },
    );
    if (followingFlight) {
      setLastSavedFlight(followingFlight);
      if (followingFlight) formik.setValues(followingFlight);
    } else {
      formik.setFieldValue('_id', null);
      formik.setFieldValue('origin', formik.values.destination);
      formik.setFieldValue('destination', null);
      setNextScheduledDepartureDateTime();
      setScheduledArrivalDateTime();
      formik.validateForm();
    }
  }

  async function handleSaveAndClose(values: FlightFormValues) {
    const success = values._id ? await handleUpdate(values) : await handleInsert(values);
    if (success) {
      const airplaneBaseId = airplane?.base?.value;
      const lastFlight = FlightsCollection.findOne(
        {
          groupId: formik.values.groupId ?? '',
        },
        { sort: { createdAt: -1 } },
      );

      if (airplaneBaseId !== lastFlight?.destination?.value) {
        // eslint-disable-next-line quotes
        enqueueSnackbar('O último vôo deve voltar para a base da Aeronave.', {
          variant: 'warning',
        });
        goToNextFlight(values._id && lastSavedFlight ? lastSavedFlight.createdAt : new Date());
      } else {
        onClose();
      }
    }
  }

  async function handleSaveAndContinue() {
    const validationResult = await formik.validateForm();

    if (Object.keys(validationResult).length > 0) {
      formik.setTouched(setNestedObjectValues(validationResult, true));
      return;
    }

    const success = formik.values._id
      ? await handleUpdate(formik.values)
      : await handleInsert(formik.values);
    if (success) {
      goToNextFlight(formik.values._id && lastSavedFlight ? lastSavedFlight.createdAt : new Date());
    }
  }

  async function handleInsert(data: FlightFormValues) {
    try {
      const { _id, ...finalData } = data as unknown as Omit<Flight, IdBaseCollectionTypes>;
      await insert(finalData);
      enqueueSnackbar('Vôo criado com sucesso.', { variant: 'success' });
      return true;
    } catch (e: unknown) {
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    return false;
  }

  async function handleUpdate(data: FlightFormValues) {
    try {
      const finalData = data as unknown as Omit<Flight, IdBaseCollectionTypes>;
      await update(finalData);
      enqueueSnackbar('Vôo atualizado com sucesso.', { variant: 'success' });
      return true;
    } catch (e: unknown) {
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    return false;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      PaperProps={{ sx: { width: 450 } }}
      open={open}
      onClose={() => {
        return;
      }}
      disableEscapeKeyDown
    >
      <DialogTitle>{formik.values._id ? 'Editar' : 'Adicionar'} Vôo</DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <form id="flight-form" noValidate onSubmit={formik.handleSubmit}>
            <Stack sx={{ mt: 1 }} spacing={3}>
              <AirplaneSelect
                required
                fullWidth
                label="Aeronave"
                name="airplane"
                onBlur={formik.handleBlur}
                value={formik.values.airplane}
                onChange={(_e, value) => {
                  formik.setFieldValue('airplane', value);
                }}
                error={!!(formik.touched.airplane && formik.errors.airplane)}
                helperText={formik.touched.airplane && formik.errors.airplane}
              />
              <AirportSelect
                required
                fullWidth
                label="Origem"
                name="origin"
                onBlur={formik.handleBlur}
                value={formik.values.origin}
                onChange={(_e, value) => {
                  formik.setFieldValue('origin', value);
                }}
                error={!!(formik.touched.origin && formik.errors.origin)}
                helperText={formik.touched.origin && formik.errors.origin}
              />
              <AirportSelect
                required
                fullWidth
                label="Destino"
                name="destination"
                onBlur={formik.handleBlur}
                value={formik.values.destination}
                onChange={(_e, value) => {
                  formik.setFieldValue('destination', value);
                }}
                error={!!(formik.touched.destination && formik.errors.destination)}
                helperText={formik.touched.destination && formik.errors.destination}
              />
              <Stack direction="row" spacing={2}>
                <DateTimePicker
                  disabled={formik.values.origin === null}
                  label={`Decolagem (${origin?.timezoneName ?? 'UTC'})`}
                  disablePast
                  timezone={origin?.timezoneName ?? 'UTC'}
                  shouldDisableDate={(date) => {
                    return !!groupFlights
                      .map((m) => dayjs(m.scheduledArrivalDateTime))
                      .find((f) => f.isSame(date, 'day') || f.isAfter(date, 'day'));
                  }}
                  value={
                    formik.values.scheduledDepartureDateTime
                      ? dayjs(formik.values.scheduledDepartureDateTime)
                      : null
                  }
                  onChange={(value) => {
                    formik.setFieldValue('scheduledDepartureDateTime', value?.toDate());
                  }}
                  onClose={() => {
                    formik.setFieldTouched('scheduledDepartureDateTime', true);
                  }}
                  slotProps={{
                    textField: {
                      error: !!(
                        formik.touched.scheduledDepartureDateTime &&
                        formik.errors.scheduledDepartureDateTime
                      ),
                      helperText:
                        formik.touched.scheduledDepartureDateTime &&
                        formik.errors.scheduledDepartureDateTime,
                    },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.dateConfirmed ?? false}
                      onChange={(_e, value) => {
                        enqueueSnackbar(`Data ${value ? '' : 'NÃO'} Confirmada`);
                        formik.setFieldValue('dateConfirmed', value);
                      }}
                      name="dateConfirmed"
                    />
                  }
                  label=""
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.timeConfirmed ?? false}
                      onChange={(_e, value) => {
                        enqueueSnackbar(`Hora ${value ? '' : 'NÃO'} Confirmada`);
                        formik.setFieldValue('timeConfirmed', value);
                      }}
                      name="timeConfirmed"
                    />
                  }
                  label=""
                />
              </Stack>
              <TextField
                required
                InputProps={{
                  readOnly: true,
                  endAdornment: calculatingDuration ? (
                    <IconButton edge="end">
                      <CircularProgress size={24} />
                    </IconButton>
                  ) : undefined,
                }}
                fullWidth
                label="Duração Prevista"
                name="estimatedDuration"
                value={formik.values.estimatedDuration}
              />
              <TextField
                required
                fullWidth
                label="Handling"
                name="estimatedHandlingDuration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.estimatedHandlingDuration}
                error={
                  !!(
                    formik.touched.estimatedHandlingDuration &&
                    formik.errors.estimatedHandlingDuration
                  )
                }
                helperText={
                  formik.touched.estimatedHandlingDuration &&
                  formik.errors.estimatedHandlingDuration
                }
              />
              <DateTimePicker
                readOnly
                label={`Chegada (${destination?.timezoneName ?? 'UTC'})`}
                timezone={destination?.timezoneName ?? 'UTC'}
                value={
                  formik.values.scheduledArrivalDateTime
                    ? dayjs(formik.values.scheduledArrivalDateTime)
                    : null
                }
              />
              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.published ?? false}
                      onChange={(_e, value) => {
                        if (!lastSavedFlight?.published) formik.setFieldValue('published', value);
                      }}
                      name="published"
                    />
                  }
                  label={lastSavedFlight?.published ? 'Vôo Publicado' : 'Publicar Vôo'}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.maintenance ?? false}
                      onChange={(_e, value) => {
                        formik.setFieldValue('maintenance', value);
                      }}
                      name="maintenance"
                    />
                  }
                  label="Manutenção"
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <UserSelect
                  required
                  fullWidth
                  disabled={formik.values.airplane === null}
                  label="Comandante"
                  name="captain"
                  roles={['Comandante']}
                  onBlur={formik.handleBlur}
                  onChange={(_e, value) => {
                    formik.setFieldValue('captain', value);
                  }}
                  filter={(o) =>
                    airplane ? (airplane.pilots ?? []).map((m) => m.value).includes(o.value) : true
                  }
                  defaultValue={formik.initialValues.captain ?? null}
                  value={formik.values.captain ?? null}
                  error={!!formik.errors.captain}
                  helperText={formik.errors.captain}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.captainInReserve ?? false}
                      onChange={(_e, value) => {
                        enqueueSnackbar(`Comandante ${value ? 'em' : 'fora de'} Reserva`);
                        formik.setFieldValue('captainInReserve', value);
                      }}
                      name="captainInReserve"
                    />
                  }
                  label=""
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <UserSelect
                  required
                  fullWidth
                  disabled={formik.values.airplane === null}
                  label="Co-Piloto"
                  name="firstOfficer"
                  roles={['Comandante', 'Co-Piloto']}
                  onBlur={formik.handleBlur}
                  onChange={(_e, value) => {
                    formik.setFieldValue('firstOfficer', value);
                  }}
                  filter={(o) =>
                    airplane ? (airplane.pilots ?? []).map((m) => m.value).includes(o.value) : true
                  }
                  defaultValue={formik.initialValues.firstOfficer ?? null}
                  value={formik.values.firstOfficer ?? null}
                  error={!!formik.errors.firstOfficer}
                  helperText={formik.errors.firstOfficer}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formik.values.firstOfficerInReserve ?? false}
                      onChange={(_e, value) => {
                        enqueueSnackbar(`Co-Piloto ${value ? 'em' : 'fora de'} Reserva`);
                        formik.setFieldValue('firstOfficerInReserve', value);
                      }}
                      name="firstOfficerInReserve"
                    />
                  }
                  label=""
                />
              </Stack>
              <UserSelect
                selectOnFocus
                clearOnBlur
                handleHomeEndKeys
                freeSolo
                multiple
                fullWidth
                disabled={formik.values.airplane === null}
                label="Passageiros"
                name="passengers"
                roles={[]}
                onBlur={formik.handleBlur}
                onChange={(_e, value) => {
                  formik.setFieldValue('passengers', value);
                }}
                defaultValue={formik.initialValues.passengers ?? undefined}
                value={formik.values.passengers ?? undefined}
                error={!!(formik.touched.passengers && formik.errors.passengers)}
                helperText={formik.touched.passengers && formik.errors.passengers}
              />

              <TextField
                fullWidth
                label="Observações"
                name="notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              <Divider textAlign="left">Solicitantes</Divider>
              <FieldArray name="requesters">
                {({
                  remove,
                  push,
                }: {
                  remove: (i: number) => void;
                  push: (i: Nullable<FlightRequester>) => void;
                }) => (
                  <>
                    <List>
                      {!!formik.values.requesters?.length &&
                        formik.values.requesters?.map((requester, index) => {
                          const requesterName = `requesters[${index}].requester`;
                          const requesterNameTouched = getIn(formik.touched, requesterName);
                          const requesterNameError = getIn(formik.errors, requesterName);

                          const costCenter = `requesters[${index}].costCenter`;
                          const costCenterTouched = getIn(formik.touched, costCenter);
                          const costCenterError = getIn(formik.errors, costCenter);

                          const percentage = `requesters[${index}].percentage`;
                          const percentageError = getIn(formik.errors, percentage);

                          return (
                            <ListItem disablePadding key={index}>
                              <Stack sx={{ mt: 1 }} spacing={3}>
                                <UserSelect
                                  fullWidth
                                  label="Solicitante"
                                  name={requesterName}
                                  roles={[]}
                                  onBlur={formik.handleBlur}
                                  onChange={(_e, value) => {
                                    formik.setFieldValue(requesterName, value);
                                  }}
                                  value={requester.requester ?? null}
                                  error={!!(requesterNameTouched && requesterNameError)}
                                  helperText={requesterNameTouched && requesterNameError}
                                />
                                <CostCenterSelect
                                  fullWidth
                                  label="Centro de Custo"
                                  name={costCenter}
                                  onBlur={formik.handleBlur}
                                  onChange={(_e, value) => {
                                    formik.setFieldValue(costCenter, value);
                                  }}
                                  value={requester.costCenter ?? null}
                                  error={!!(costCenterTouched && costCenterError)}
                                  helperText={costCenterTouched && costCenterError}
                                />
                                <TextField
                                  fullWidth
                                  label="Porcentagem"
                                  type="number"
                                  name={percentage}
                                  onBlur={formik.handleBlur}
                                  onChange={formik.handleChange}
                                  value={requester.percentage}
                                  error={!!percentageError}
                                  helperText={percentageError}
                                />
                                <Button
                                  onClick={() => {
                                    const count = (formik.values.requesters?.length ?? 0) - 1;
                                    const percentage = parseFloat((100 / count).toFixed(2));
                                    formik.values.requesters?.forEach((_r, i) => {
                                      formik.setFieldValue(
                                        `requesters[${i}].percentage`,
                                        percentage,
                                      );
                                    });
                                    remove(index);
                                  }}
                                >
                                  Remover
                                </Button>
                              </Stack>
                            </ListItem>
                          );
                        })}
                    </List>
                    <Button
                      onClick={() => {
                        const count = (formik.values.requesters?.length ?? 0) + 1;
                        const percentage = parseFloat((100 / count).toFixed(2));
                        formik.values.requesters?.forEach((_r, i) => {
                          formik.setFieldValue(`requesters[${i}].percentage`, percentage);
                        });
                        push({ costCenter: null, percentage, requester: null });
                      }}
                    >
                      Adicionar Solicitante
                    </Button>
                  </>
                )}
              </FieldArray>
            </Stack>
          </form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSaveAndContinue} autoFocus>
          Salvar e Continuar
        </Button>
        <Button type="submit" form="flight-form">
          Salvar e Finalizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightForm;
