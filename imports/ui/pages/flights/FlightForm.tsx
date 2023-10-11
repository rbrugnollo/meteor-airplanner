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

type FlightFormValues = Nullable<Omit<Flight, IdBaseCollectionTypes | 'status'>>;

interface FlightFormProps {
  readonly flightId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const FlightForm = ({ flightId, open, onClose }: FlightFormProps) => {
  const [airplane, setAirplane] = useState<Airplane | undefined>(undefined);
  const [calculatingDuration, setCalculatingDuration] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<FlightFormValues>({
    initialValues: {
      _id: null,
      groupId: null,
      airplane: null,
      scheduledDateTime: null,
      estimatedDuration: '',
      handlingDuration: '00:30',
      origin: null,
      destination: null,
      captain: null,
      firstOfficer: null,
      passengers: [],
      requesters: [],
      notes: '',
    },
    validate: (values) => {
      let errors: FormikErrors<FlightFormValues> = {};
      if (airplane && (values.passengers?.length ?? 0) > airplane.seats) {
        errors = {
          ...errors,
          passengers: `This airplane can only fit ${airplane.seats} passengers.`,
        };
      }
      return errors;
    },
    validationSchema: Yup.object<FlightFormValues>().shape({
      airplane: Yup.object().required('Airplane is required'),
      scheduledDateTime: Yup.date().required('Date Time is required'),
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
      if (success) onClose();
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
      if (flight) {
        formik.setValues(flight);
      }
    } else {
      formik.setFieldValue('groupId', createUuid());
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
        .then((duration) => {
          formik.setFieldValue('estimatedDuration', duration ?? '');
        })
        .finally(() => {
          setCalculatingDuration(false);
        });
    }
  }, [formik.values.origin, formik.values.destination, formik.values.airplane]);

  const handleSaveAndContinue = async () => {
    const a = await formik.validateForm();
    if (isEmpty(a)) {
      const success = formik.values._id
        ? await handleUpdate(formik.values)
        : await handleInsert(formik.values);
      if (success) {
        formik.setFieldValue('_id', null);
        formik.setFieldValue('origin', formik.values.destination);
        formik.setFieldValue('scheduledDateTime', null);
        formik.setFieldValue('destination', null);
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

  const handleFetchAirplane = async (airplaneId?: string) => {
    setAirplane(undefined);
    if (airplaneId) {
      const airplane = await getOneAirplane({ _id: airplaneId });
      if (airplane) {
        setAirplane(airplane);
        formik.setFieldValue('captain', airplane.captain);
        formik.setFieldValue('firstOfficer', airplane.firstOfficer);
      }
    }
  };

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
                handleFetchAirplane(value?.value);
                formik.setFieldValue('airplane', value);
              }}
              error={!!(formik.touched.airplane && formik.errors.airplane)}
              helperText={formik.touched.airplane && formik.errors.airplane}
            />
            <DateTimePicker
              label="Date and Time"
              disablePast
              shouldDisableDate={(date) => {
                return !!groupFlights
                  .map((m) => dayjs(m.scheduledDateTime))
                  .find((f) => f.isSame(date, 'day') || f.isAfter(date, 'day'));
              }}
              value={
                formik.values.scheduledDateTime ? dayjs(formik.values.scheduledDateTime) : null
              }
              onChange={(value) => {
                formik.setFieldValue('scheduledDateTime', value?.toDate());
              }}
              onClose={() => {
                formik.setFieldTouched('scheduledDateTime', true);
              }}
              slotProps={{
                textField: {
                  error: !!(formik.touched.scheduledDateTime && formik.errors.scheduledDateTime),
                  helperText: formik.touched.scheduledDateTime && formik.errors.scheduledDateTime,
                },
              }}
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
