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
  Stack,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  List,
  Checkbox,
  Divider,
  ListItem,
} from '@mui/material';
import { FormikErrors, useFormik, FormikProvider, FieldArray, getIn } from 'formik';
import { update } from '/imports/api/flights/methods/update';
import { useSnackbar } from 'notistack';
import {
  Flight,
  FlightCrewExpenses,
  FlightExpenses,
  FlightFuelExpenses,
  FlightHangarExpenses,
  FlightMaintenanceExpenses,
  FlightRequester,
  FlightsCollection,
} from '/imports/api/flights/collection';
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
import createUuid from '../../shared/functions/createUuid';
import { Airport } from '/imports/api/airports/collection';
import CostCenterSelect from '../../shared/selects/CostCenterSelect';
import { sum } from 'lodash';
import { calculateDuration } from '/imports/api/flights/methods/calculateDuration';

interface ReviewFlightFormFlightExpensesValues
  extends Omit<Nullable<FlightExpenses>, 'fuel' | 'hangar' | 'maintenance' | 'crew'> {
  readonly fuel?: Nullable<FlightFuelExpenses>;
  readonly hangar?: Nullable<FlightHangarExpenses>;
  readonly maintenance?: Nullable<FlightMaintenanceExpenses>;
  readonly crew?: Nullable<FlightCrewExpenses>;
}

interface ReviewFlightFormValues
  extends Omit<Nullable<Flight>, IdBaseCollectionTypes | 'expenses'> {
  readonly expenses?: ReviewFlightFormFlightExpensesValues;
}

interface ReviewFlightFormProps {
  readonly flightId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const ReviewFlightForm = ({ flightId, open, onClose }: ReviewFlightFormProps) => {
  const [airplane, setAirplane] = useState<Airplane | undefined>(undefined);
  const [origin, setOrigin] = useState<Airport | undefined>(undefined);
  const [lastSavedFlight, setLastSavedFlight] = useState<Flight | undefined>(undefined);
  const [destination, setDestination] = useState<Airport | undefined>(undefined);
  const [calculatingDuration, setCalculatingDuration] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<ReviewFlightFormValues>({
    initialValues: {
      _id: null,
      groupId: null,
      airplane: null,
      scheduledDepartureDateTime: null,
      scheduledArrivalDateTime: null,
      estimatedDuration: '',
      estimatedHandlingDuration: '00:30',
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
      expenses: {
        fuel: {
          pounds: null,
          liters: null,
          unitPrice: null,
          subTotal: null,
        },
        hangar: {
          stopover: null,
          ramp: null,
          price: null,
          subTotal: null,
        },
        maintenance: {
          maintenancePrice: null,
          duration: null,
          dolarPrice: null,
          subTotal: null,
        },
        crew: {
          flightAttendant: null,
          security: null,
          transportation: null,
          hotel: null,
          food: null,
          subTotal: null,
        },
        landings: null,
        landingsPrice: null,
        decea: null,
        other: null,
        grandTotal: null,
      },
    },
    validate: async (values) => {
      let errors: FormikErrors<ReviewFlightFormValues> = {};

      // Validate airplane seats
      if (airplane && (values.passengers?.length ?? 0) > airplane.seats) {
        errors = {
          ...errors,
          passengers: `Limite máximo de ${airplane.seats} passageiros.`,
        };
      }

      return errors;
    },
    validationSchema: Yup.object<ReviewFlightFormValues>().shape({
      airplane: Yup.object().required('Aeronave é obrigatório'),
      departureDateTime: Yup.date().required('Data e Hora é obrigatório'),
      duration: Yup.string()
        .required('Tempo de vôo é obrigatório')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Formato inválido (hh:mm)'),
      handlingDuration: Yup.string()
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
              const values = this.from?.[1]?.value as ReviewFlightFormValues;
              if (!values || !values.requesters) return true;
              const totalPercentage = sum(values.requesters.map((m) => m.percentage ?? 0));
              return totalPercentage > 99 && totalPercentage < 101;
            }),
        }),
      ),
    }),
    onSubmit: handleSave,
    enableReinitialize: true,
  });

  useEffect(() => {
    formik.resetForm();
    if (!open) return;
    if (flightId) {
      const flight = FlightsCollection.findOne(flightId);
      setLastSavedFlight(flight);
      if (flight)
        formik.setValues({
          ...flight,
          duration: flight.duration ?? flight.estimatedDuration,
          handlingDuration: flight.handlingDuration ?? flight.estimatedHandlingDuration,
          departureDateTime: flight.departureDateTime ?? flight.scheduledDepartureDateTime,
          arrivalDateTime: flight.arrivalDateTime ?? flight.scheduledArrivalDateTime,
        });
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
        .then((duration) => {
          if (duration) {
            formik.setFieldValue('estimatedDuration', duration ?? '');
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

  useEffect(() => {
    formik.setFieldValue(
      'expenses.fuel.subTotal',
      (formik.values.expenses?.fuel?.unitPrice ?? 0) * (formik.values.expenses?.fuel?.liters ?? 0),
    );
  }, [
    formik.values.expenses?.fuel?.pounds,
    formik.values.expenses?.fuel?.liters,
    formik.values.expenses?.fuel?.unitPrice,
  ]);

  useEffect(() => {
    formik.setFieldValue(
      'expenses.hangar.subTotal',
      sum([
        formik.values.expenses?.hangar?.stopover ?? 0,
        formik.values.expenses?.hangar?.ramp ?? 0,
        formik.values.expenses?.hangar?.price ?? 0,
      ]),
    );
  }, [
    formik.values.expenses?.hangar?.stopover,
    formik.values.expenses?.hangar?.ramp,
    formik.values.expenses?.hangar?.price,
  ]);

  useEffect(() => {
    formik.setFieldValue(
      'expenses.maintenance.subTotal',
      (formik.values.expenses?.maintenance?.maintenancePrice ?? 0) *
        (formik.values.expenses?.maintenance?.dolarPrice ?? 0),
    );
  }, [
    formik.values.expenses?.maintenance?.maintenancePrice,
    formik.values.expenses?.maintenance?.dolarPrice,
  ]);

  useEffect(() => {
    formik.setFieldValue(
      'expenses.crew.subTotal',
      sum([
        formik.values.expenses?.crew?.flightAttendant ?? 0,
        formik.values.expenses?.crew?.security ?? 0,
        formik.values.expenses?.crew?.transportation ?? 0,
        formik.values.expenses?.crew?.hotel ?? 0,
        formik.values.expenses?.crew?.food ?? 0,
      ]),
    );
  }, [
    formik.values.expenses?.crew?.flightAttendant,
    formik.values.expenses?.crew?.security,
    formik.values.expenses?.crew?.transportation,
    formik.values.expenses?.crew?.hotel,
    formik.values.expenses?.crew?.food,
  ]);

  useEffect(() => {
    formik.setFieldValue(
      'expenses.grandTotal',
      sum([
        formik.values.expenses?.fuel?.subTotal ?? 0,
        formik.values.expenses?.hangar?.subTotal ?? 0,
        formik.values.expenses?.maintenance?.subTotal ?? 0,
        formik.values.expenses?.crew?.subTotal ?? 0,
        formik.values.expenses?.landingsPrice ?? 0,
        formik.values.expenses?.decea ?? 0,
        formik.values.expenses?.other ?? 0,
      ]),
    );
  }, [
    formik.values.expenses?.fuel?.subTotal,
    formik.values.expenses?.hangar?.subTotal,
    formik.values.expenses?.maintenance?.subTotal,
    formik.values.expenses?.crew?.subTotal,
    formik.values.expenses?.landingsPrice,
    formik.values.expenses?.decea,
    formik.values.expenses?.other,
  ]);

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

  async function handleSave(values: ReviewFlightFormValues) {
    if (await handleUpdate(values)) {
      const lastFlight = FlightsCollection.findOne(
        {
          groupId: formik.values.groupId ?? '',
        },
        { sort: { createdAt: -1 } },
      );

      if (values._id !== lastFlight?.destination?.value) {
        goToNextFlight(values._id && lastSavedFlight ? lastSavedFlight.createdAt : new Date());
      } else {
        onClose();
      }
    }
  }

  async function handleUpdate(data: ReviewFlightFormValues) {
    try {
      const finalData = data as unknown as Omit<Flight, IdBaseCollectionTypes>;
      await update(finalData);
      enqueueSnackbar('Flight atualizado com sucesso.', { variant: 'success' });
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
      <DialogTitle>Revisar Vôo</DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <form id="review-flight-form" noValidate onSubmit={formik.handleSubmit}>
            <Stack sx={{ mt: 1 }} spacing={3}>
              <AirplaneSelect
                fullWidth
                label="Aeronave"
                name="airplane"
                required
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
              <DateTimePicker
                disabled={formik.values.origin === null}
                label={`Decolagem (${origin?.timezoneName ?? 'UTC'})`}
                disablePast
                timezone={origin?.timezoneName ?? 'UTC'}
                value={
                  formik.values.departureDateTime ? dayjs(formik.values.departureDateTime) : null
                }
                onChange={(value) => {
                  formik.setFieldValue('departureDateTime', value?.toDate());
                }}
                onClose={() => {
                  formik.setFieldTouched('departureDateTime', true);
                }}
                slotProps={{
                  textField: {
                    error: !!(formik.touched.departureDateTime && formik.errors.departureDateTime),
                    helperText: formik.touched.departureDateTime && formik.errors.departureDateTime,
                  },
                }}
              />
              <TextField
                required
                fullWidth
                label="Duração"
                name="duration"
                InputProps={{
                  readOnly: true,
                  endAdornment: calculatingDuration ? (
                    <IconButton edge="end">
                      <CircularProgress size={24} />
                    </IconButton>
                  ) : undefined,
                }}
                value={formik.values.duration}
              />
              <TextField
                required
                fullWidth
                label="Handling"
                name="estimatedHandlingDuration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.handlingDuration}
                error={!!(formik.touched.handlingDuration && formik.errors.handlingDuration)}
                helperText={formik.touched.handlingDuration && formik.errors.handlingDuration}
              />
              <DateTimePicker
                readOnly
                label={`Chegada (${destination?.timezoneName ?? 'UTC'})`}
                timezone={destination?.timezoneName ?? 'UTC'}
                value={formik.values.arrivalDateTime ? dayjs(formik.values.arrivalDateTime) : null}
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

              <Divider textAlign="left">Despesas - Combustível</Divider>
              <TextField
                fullWidth
                label="Libras"
                type="number"
                name="expenses.fuel.pounds"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.fuel?.pounds}
              />
              <TextField
                fullWidth
                label="Litros"
                type="number"
                name="expenses.fuel.liters"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.fuel?.liters}
              />
              <TextField
                fullWidth
                label="Unitário"
                type="number"
                name="expenses.fuel.unitPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.fuel?.unitPrice}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total"
                type="number"
                name="expenses.fuel.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.fuel?.subTotal}
              />

              <Divider textAlign="left">Despesas - Hangar</Divider>
              <TextField
                fullWidth
                label="Pernoite"
                type="number"
                name="expenses.hangar.stopover"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.hangar?.stopover}
              />
              <TextField
                fullWidth
                label="Valor"
                type="number"
                name="expenses.hangar.price"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.hangar?.price}
              />
              <TextField
                fullWidth
                label="Rampa"
                type="number"
                name="expenses.hangar.ramp"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.hangar?.ramp}
              />
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label="Total"
                type="number"
                name="expenses.hangar.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.hangar?.subTotal}
              />

              <Divider textAlign="left">Despesas - Manutenção</Divider>
              <TextField
                fullWidth
                label="Manutenção"
                type="number"
                name="expenses.maintenance.maintenancePrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.maintenance?.maintenancePrice}
              />
              <TextField
                fullWidth
                label="Horas"
                type="number"
                name="expenses.maintenance.duration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.maintenance?.duration}
              />
              <TextField
                fullWidth
                label="Dólar"
                type="number"
                name="expenses.maintenance.dolarPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.maintenance?.dolarPrice}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total"
                type="number"
                name="expenses.maintenance.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.maintenance?.subTotal}
              />

              <Divider textAlign="left">Despesas - Tripulação</Divider>
              <TextField
                fullWidth
                label="Comissária"
                type="number"
                name="expenses.crew.flightAttendant"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.flightAttendant}
              />
              <TextField
                fullWidth
                label="Revistas"
                type="number"
                name="expenses.crew.security"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.security}
              />
              <TextField
                fullWidth
                label="Transporte"
                type="number"
                name="expenses.crew.transportation"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.transportation}
              />
              <TextField
                fullWidth
                label="Hotel"
                type="number"
                name="expenses.crew.hotel"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.hotel}
              />
              <TextField
                fullWidth
                label="Refeição"
                type="number"
                name="expenses.crew.food"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.food}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total"
                type="number"
                name="expenses.crew.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.crew?.subTotal}
              />

              <Divider textAlign="left">Despesas - Outros</Divider>
              <TextField
                fullWidth
                label="Número de Pousos"
                type="number"
                name="expenses.landings"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.landings}
              />
              <TextField
                fullWidth
                label="Custo de Pousos"
                type="number"
                name="expenses.landingsPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.landingsPrice}
              />
              <TextField
                fullWidth
                label="Decea"
                type="number"
                name="expenses.decea"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.decea}
              />
              <TextField
                fullWidth
                label="Outros"
                type="number"
                name="expenses.other"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.other}
              />
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label="GrandTotal"
                type="number"
                name="expenses.grandTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expenses?.grandTotal}
              />
            </Stack>
          </form>
        </FormikProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="review-flight-form" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewFlightForm;
