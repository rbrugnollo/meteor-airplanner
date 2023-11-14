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
  List,
  ListItem,
} from '@mui/material';
import { FormikErrors, useFormik, FormikProvider, FieldArray, getIn } from 'formik';
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
import { Airport } from '/imports/api/airports/collection';
import CostCenterSelect from '../../shared/selects/CostCenterSelect';
import { sum } from 'lodash';

type ReviewFlightFormValues = Partial<Nullable<Omit<Flight, IdBaseCollectionTypes>>>;

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

  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<ReviewFlightFormValues>({
    initialValues: {
      _id: null,
      groupId: null,
      airplane: null,
      departureDateTime: null,
      arrivalDateTime: null,
      duration: '',
      handlingDuration: '',
      origin: null,
      destination: null,
      captain: null,
      captainInReserve: true,
      firstOfficer: null,
      firstOfficerInReserve: true,
      passengers: [],
      requesters: [],
      expensenses: {
        fuel: {
          pounds: 0,
          liters: 0,
          unitPrice: 0,
          subTotal: 0,
        },
        hangar: {
          stopover: undefined,
          ramp: undefined,
          price: undefined,
          subTotal: 0,
        },
        maintenance: {
          maintenancePrice: 0,
          duration: 0,
          dolarPrice: 0,
          subTotal: 0,
        },
        crew: {
          flightAttendant: undefined,
          security: undefined,
          transportation: undefined,
          hotel: undefined,
          food: undefined,
          subTotal: 0,
        },
        landings: undefined,
        landingsPrice: undefined,
        decea: undefined,
        other: undefined,
        grandTotal: 0,
      },
      notes: '',
    },
    validate: async (values) => {
      let errors: FormikErrors<ReviewFlightFormValues> = {};

      // Validate airplane seats
      if (airplane && (values.passengers?.length ?? 0) > airplane.seats) {
        errors = {
          ...errors,
          passengers: `This airplane can only fit ${airplane.seats} passengers.`,
        };
      }

      return errors;
    },
    validationSchema: Yup.object<ReviewFlightFormValues>().shape({
      airplane: Yup.object().required('Airplane é obrigatório'),
      departureDateTime: Yup.date().required('Date Time é obrigatório'),
      duration: Yup.string()
        .required('Duration é obrigatório')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Invalid format (hh:mm)'),
      handlingDuration: Yup.string()
        .required('Handling é obrigatório')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Invalid format (hh:mm)'),
      origin: Yup.object().required('Origin é obrigatório'),
      destination: Yup.object().required('Destination é obrigatório'),
      requesters: Yup.array().of(
        Yup.object().shape({
          requester: Yup.object().required('Requester é obrigatório'),
          costCenter: Yup.object().required('Cost Center é obrigatório'),
          percentage: Yup.number()
            .required('Percentage é obrigatório')
            .test('sum', 'Sum must be 100%', function (_v) {
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
      if (flight)
        formik.setValues({
          ...flight,
          duration: flight.estimatedDuration,
          handlingDuration: flight.estimatedHandlingDuration,
          departureDateTime: flight.scheduledDepartureDateTime,
          arrivalDateTime: flight.scheduledArrivalDateTime,
        });
    } else {
      formik.setFieldValue('groupId', createUuid());
      setLastSavedFlight(undefined);
    }
  }, [open]);

  useEffect(() => {
    formik.setFieldValue('arrivalDateTime', '');
    const { departureDateTime, duration, handlingDuration } = formik.values;
    if (departureDateTime && duration && handlingDuration) {
      const arrival = dayjs(departureDateTime)
        .add(parseInt(duration.split(':')[0]), 'hour')
        .add(parseInt(duration.split(':')[1]), 'minute')
        .add(parseInt(handlingDuration.split(':')[0]), 'hour')
        .add(parseInt(handlingDuration.split(':')[1]), 'minute')
        .tz(destination?.timezoneName ?? 'UTC')
        .toDate();

      formik.setFieldValue('arrivalDateTime', arrival);
    }
  }, [
    destination,
    formik.values.departureDateTime,
    formik.values.duration,
    formik.values.handlingDuration,
  ]);

  useEffect(() => {
    setAirplane(undefined);
    if (formik.values.airplane) {
      getOneAirplane({ _id: formik.values.airplane.value })
        .then((a) => a)
        .then((airplane) => {
          if (airplane) {
            setAirplane(airplane);
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

  function goToNextFlight(createdAtAfter: Date) {
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
      <DialogTitle>Review Flight</DialogTitle>
      <DialogContent>
        <FormikProvider value={formik}>
          <form id="review-flight-form" noValidate onSubmit={formik.handleSubmit}>
            <Stack sx={{ mt: 1 }} spacing={3}>
              <AirplaneSelect
                fullWidth
                label="Airplane"
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
                fullWidth
                label="Origin"
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
                fullWidth
                label="Destination"
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
                label={`Departure (${origin?.timezoneName ?? 'UTC'})`}
                disablePast
                timezone={origin?.timezoneName ?? 'UTC'}
                shouldDisableDate={(date) => {
                  return !!groupFlights
                    .map((m) => dayjs(m.departureDateTime))
                    .find((f) => f.isSame(date, 'day') || f.isAfter(date, 'day'));
                }}
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
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label="Duration"
                name="duration"
                value={formik.values.duration}
              />
              <TextField
                fullWidth
                label="Handling"
                name="handlingDuration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.handlingDuration}
                error={!!(formik.touched.handlingDuration && formik.errors.handlingDuration)}
                helperText={formik.touched.handlingDuration && formik.errors.handlingDuration}
              />
              <DateTimePicker
                readOnly
                label={`Arrival (${destination?.timezoneName ?? 'UTC'})`}
                timezone={destination?.timezoneName ?? 'UTC'}
                value={formik.values.arrivalDateTime ? dayjs(formik.values.arrivalDateTime) : null}
              />
              <UserSelect
                fullWidth
                disabled={formik.values.airplane === null}
                label="Captain"
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
                  <Switch
                    checked={formik.values.captainInReserve ?? false}
                    onChange={(_e, value) => {
                      formik.setFieldValue('captainInReserve', value);
                    }}
                    name="captainInReserve"
                  />
                }
                label="Captain in Reserve"
              />
              <UserSelect
                fullWidth
                disabled={formik.values.airplane === null}
                label="First Officer"
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
                  <Switch
                    checked={formik.values.firstOfficerInReserve ?? false}
                    onChange={(_e, value) => {
                      formik.setFieldValue('firstOfficerInReserve', value);
                    }}
                    name="firstOfficerInReserve"
                  />
                }
                label="First Officer in Reserve"
              />
              <UserSelect
                multiple
                fullWidth
                disabled={formik.values.airplane === null}
                label="Passengers"
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
                label="Maintenance"
              />
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />

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
                                  label="Requester"
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
                                  label="Cost Center"
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
                                  label="Percentage"
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
                                  Remove
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
                      Add Requester
                    </Button>
                  </>
                )}
              </FieldArray>

              <TextField
                fullWidth
                label="Pounds"
                type="number"
                name="expensenses.fuel.pounds"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.fuel?.pounds}
              />
              <TextField
                fullWidth
                label="Liters"
                type="number"
                name="expensenses.fuel.liters"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.fuel?.liters}
              />
              <TextField
                fullWidth
                label="Unit Price"
                type="number"
                name="expensenses.fuel.unitPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.fuel?.unitPrice}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total Price"
                type="number"
                name="expensenses.fuel.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.fuel?.subTotal}
              />

              <TextField
                fullWidth
                label="Stopover"
                type="number"
                name="expensenses.hangar.stopover"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.hangar?.stopover}
              />
              <TextField
                fullWidth
                label="Ramp"
                type="number"
                name="expensenses.hangar.ramp"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.hangar?.ramp}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                name="expensenses.hangar.price"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.hangar?.price}
              />
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label="Total"
                type="number"
                name="expensenses.hangar.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.hangar?.subTotal}
              />

              <TextField
                fullWidth
                label="Price"
                type="number"
                name="expensenses.maintenance.maintenancePrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.maintenance?.maintenancePrice}
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                name="expensenses.maintenance.duration"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.maintenance?.duration}
              />
              <TextField
                fullWidth
                label="Dolar"
                type="number"
                name="expensenses.maintenance.dolarPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.maintenance?.dolarPrice}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total"
                type="number"
                name="expensenses.maintenance.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.maintenance?.subTotal}
              />

              <TextField
                fullWidth
                label="Flight Attendant"
                type="number"
                name="expensenses.crew.flightAttendant"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.flightAttendant}
              />
              <TextField
                fullWidth
                label="Security"
                type="number"
                name="expensenses.crew.security"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.security}
              />
              <TextField
                fullWidth
                label="Transportation"
                type="number"
                name="expensenses.crew.transportation"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.transportation}
              />
              <TextField
                fullWidth
                label="Hotel"
                type="number"
                name="expensenses.crew.hotel"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.hotel}
              />
              <TextField
                fullWidth
                label="Food"
                type="number"
                name="expensenses.crew.food"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.food}
              />
              <TextField
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
                label="Total"
                type="number"
                name="expensenses.crew.subTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.crew?.subTotal}
              />

              <TextField
                fullWidth
                label="Landings"
                type="number"
                name="expensenses.landings"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.landings}
              />
              <TextField
                fullWidth
                label="Landings Price"
                type="number"
                name="expensenses.landingsPrice"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.landingsPrice}
              />
              <TextField
                fullWidth
                label="Decea"
                type="number"
                name="expensenses.decea"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.decea}
              />
              <TextField
                fullWidth
                label="Other"
                type="number"
                name="expensenses.other"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.other}
              />
              <TextField
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                label="GrandTotal"
                type="number"
                name="expensenses.grandTotal"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.expensenses?.grandTotal}
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
