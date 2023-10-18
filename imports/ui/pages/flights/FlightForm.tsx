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
} from '@mui/material';
import { FormikErrors, useFormik } from 'formik';
import { insert } from '/imports/api/flights/methods/insert';
import { update } from '/imports/api/flights/methods/update';
import { useSnackbar } from 'notistack';
import { Flight, FlightsCollection } from '/imports/api/flights/collection';
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
import { isEmpty } from 'lodash';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import createUuid from '../../shared/functions/createUuid';
import { list } from '/imports/api/flights/publications/list';
import { calculateDuration } from '/imports/api/flights/methods/calculateDuration';
import { Airport } from '/imports/api/airports/collection';
import { checkAvailability } from '/imports/api/airplanes/methods/checkAvailability';
import { checkLocation } from '/imports/api/airplanes/methods/checkLocation';

type FlightFormValues = Nullable<Omit<Flight, IdBaseCollectionTypes | 'status'>>;

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
      handlingDuration: '00:30',
      origin: null,
      destination: null,
      published: false,
      dateConfirmed: false,
      timeConfirmed: false,
      captain: null,
      captainInReserve: true,
      firstOfficer: null,
      firstOfficerInReserve: true,
      passengers: [],
      requesters: [],
      notes: '',
    },
    validate: async (values) => {
      let errors: FormikErrors<FlightFormValues> = {};

      // Validate airplane seats
      if (airplane && (values.passengers?.length ?? 0) > airplane.seats) {
        errors = {
          ...errors,
          passengers: `This airplane can only fit ${airplane.seats} passengers.`,
        };
      }

      // Validate airplane availability
      if (values.airplane && values.scheduledDepartureDateTime && values.scheduledArrivalDateTime) {
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

      // Validate airplane location
      if (values.airplane && values.origin && values.scheduledDepartureDateTime) {
        const airplaneLocationErrors = await checkLocation({
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
      airplane: Yup.object().required('Airplane is required'),
      scheduledDepartureDateTime: Yup.date().required('Date Time is required'),
      estimatedDuration: Yup.string()
        .required('Duration is required')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Invalid format (hh:mm)'),
      handlingDuration: Yup.string()
        .required('Handling is required')
        .matches(/^\d{1,2}:\d{1,2}$/, 'Invalid format (hh:mm)'),
      origin: Yup.object().required('Origin is required'),
      destination: Yup.object().required('Destination is required'),
    }),
    onSubmit: async (values) => {
      const success = values._id ? await handleUpdate(values) : await handleInsert(values);
      if (success) {
        onClose();
      }
    },
    enableReinitialize: true,
  });

  useSubscribe(() => {
    return list({
      selector: {
        $and: [{ groupId: formik.values.groupId ?? '' }, { _id: { $ne: formik.values._id ?? '' } }],
      },
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
    formik.setFieldValue('scheduledArrivalDateTime', '');
    const { scheduledDepartureDateTime, estimatedDuration, handlingDuration } = formik.values;
    if (scheduledDepartureDateTime && estimatedDuration && handlingDuration) {
      const arrival = dayjs(scheduledDepartureDateTime)
        .add(parseInt(estimatedDuration.split(':')[0]), 'hour')
        .add(parseInt(estimatedDuration.split(':')[1]), 'minute')
        .add(parseInt(handlingDuration.split(':')[0]), 'hour')
        .add(parseInt(handlingDuration.split(':')[1]), 'minute')
        .tz(destination?.timezoneName ?? 'UTC')
        .toDate();

      formik.setFieldValue('scheduledArrivalDateTime', arrival);
    }
  }, [
    destination,
    formik.values.scheduledDepartureDateTime,
    formik.values.estimatedDuration,
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

  const handleSaveAndContinue = async () => {
    const a = await formik.validateForm();
    if (isEmpty(a)) {
      const dateBeforeSave = new Date();
      const success = formik.values._id
        ? await handleUpdate(formik.values)
        : await handleInsert(formik.values);
      if (success) {
        // If there's a following flight for the groupId, load it
        // otherwise, start a new flight
        const followingFlight = FlightsCollection.findOne(
          {
            groupId: formik.values.groupId ?? '',
            createdAt: { $gt: lastSavedFlight?.createdAt ?? dateBeforeSave },
          },
          { sort: { createdAt: 1 } },
        );
        if (followingFlight) {
          setLastSavedFlight(followingFlight);
          if (followingFlight) formik.setValues(followingFlight);
        } else {
          formik.setFieldValue('_id', null);
          formik.setFieldValue('origin', formik.values.destination);
          formik.setFieldValue('scheduledDepartureDateTime', null);
          formik.setFieldValue('destination', null);
          formik.setFieldValue('scheduledArrivalDateTime', null);
        }
      }
    }
  };

  const handleInsert = async (data: FlightFormValues) => {
    try {
      const { _id, ...finalData } = data as unknown as Omit<Flight, IdBaseCollectionTypes>;
      await insert(finalData);
      enqueueSnackbar('Flight successfully created.', { variant: 'success' });
      return true;
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    return false;
  };

  const handleUpdate = async (data: FlightFormValues) => {
    try {
      const finalData = data as unknown as Omit<Flight, IdBaseCollectionTypes>;
      await update(finalData);
      enqueueSnackbar('Flight successfully updated.', { variant: 'success' });
      return true;
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
    return false;
  };

  console.log('lastSavedFlight?.published', lastSavedFlight?.published);

  return (
    <Dialog
      fullScreen={fullScreen}
      PaperProps={{ sx: { width: 450 } }}
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{formik.values._id ? 'Update' : 'Add new'} Flight</DialogTitle>
      <DialogContent>
        <form id="flight-form" noValidate onSubmit={formik.handleSubmit}>
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
                  .map((m) => dayjs(m.scheduledDepartureDateTime))
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
            <TextField
              InputProps={{
                readOnly: true,
                endAdornment: calculatingDuration ? (
                  <IconButton edge="end">
                    <CircularProgress size={24} />
                  </IconButton>
                ) : undefined,
              }}
              fullWidth
              label="Estimated Duration"
              name="estimatedDuration"
              value={formik.values.estimatedDuration}
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
              value={
                formik.values.scheduledArrivalDateTime
                  ? dayjs(formik.values.scheduledArrivalDateTime)
                  : null
              }
            />
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
              label={lastSavedFlight?.published ? 'Flight Published' : 'Publish this Flight'}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.dateConfirmed ?? false}
                  onChange={(_e, value) => {
                    formik.setFieldValue('dateConfirmed', value);
                  }}
                  name="dateConfirmed"
                />
              }
              label="Date Confirmed"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.timeConfirmed ?? false}
                  onChange={(_e, value) => {
                    formik.setFieldValue('timeConfirmed', value);
                  }}
                  name="timeConfirmed"
                />
              }
              label="Time Confirmed"
            />
            <UserSelect
              fullWidth
              disabled={formik.values.airplane === null}
              label="Captain"
              name="captain"
              roles={['Captain']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('captain', value);
              }}
              filter={(o) =>
                airplane ? (airplane.pilots ?? []).map((m) => m.value).includes(o.value) : true
              }
              defaultValue={formik.initialValues.captain ?? null}
              value={formik.values.captain ?? null}
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
              roles={['Captain', 'First Officer']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('firstOfficer', value);
              }}
              filter={(o) =>
                airplane ? (airplane.pilots ?? []).map((m) => m.value).includes(o.value) : true
              }
              defaultValue={formik.initialValues.firstOfficer ?? null}
              value={formik.values.firstOfficer ?? null}
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
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveAndContinue} autoFocus>
          Save and Continue
        </Button>
        <Button type="submit" form="flight-form" autoFocus>
          Save and Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlightForm;
