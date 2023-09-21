import React, { useEffect } from 'react';
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
} from '@mui/material';
import { useFormik } from 'formik';
import { insert } from '/imports/api/airports/methods/insert';
import { update } from '/imports/api/airports/methods/update';
import { useSnackbar } from 'notistack';
import { Airport, AirportsCollection } from '/imports/api/airports/collection';
import { Meteor } from 'meteor/meteor';
import { BaseCollectionTypes } from '/imports/api/common/BaseCollection';

type AirportFormValues = Omit<Airport, BaseCollectionTypes>;

interface AirportFormProps {
  readonly airportId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const AirportForm = ({ airportId, open, onClose }: AirportFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<AirportFormValues>({
    initialValues: {
      name: '',
      city: '',
      country: '',
      iata: '',
      icao: '',
      lat: '',
      lon: '',
      timezone: '',
    },
    validationSchema: Yup.object<AirportFormValues>().shape({
      name: Yup.string().required('Name is required'),
      city: Yup.string().required('City is required'),
      country: Yup.string().required('Country is required'),
      iata: Yup.string().required('Iata is required'),
      icao: Yup.string().required('Icao is required'),
      lat: Yup.string().required('Latitute is required'),
      lon: Yup.string().required('Longitude is required'),
      timezone: Yup.string().required('Timezone is required'),
    }),
    onSubmit: async (values) => {
      if (airportId) {
        await handleUpdate(values);
      } else {
        await handleInsert(values);
      }
    },
    enableReinitialize: true,
  });
  useEffect(() => {
    formik.resetForm();
    if (open && airportId) {
      const airport = AirportsCollection.findOne(airportId);
      if (airport) {
        const { _id, ...values } = airport;
        formik.setValues(values);
      }
    }
  }, [open]);

  const handleInsert = async (data: AirportFormValues) => {
    try {
      await insert(data);
      enqueueSnackbar('Airport successfully created.', { variant: 'success' });
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (data: AirportFormValues) => {
    try {
      await update({
        _id: airportId!,
        ...data,
      });
      enqueueSnackbar('Airport successfully updated.', { variant: 'success' });
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
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
      <DialogTitle>{airportId ? 'Update' : 'Add new'} Airport</DialogTitle>
      <DialogContent>
        <form id="airport-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              error={!!(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
              label="Name"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <TextField
              error={!!(formik.touched.city && formik.errors.city)}
              fullWidth
              helperText={formik.touched.city && formik.errors.city}
              label="City"
              name="city"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.city}
            />
            <TextField
              error={!!(formik.touched.country && formik.errors.country)}
              fullWidth
              helperText={formik.touched.country && formik.errors.country}
              label="Country"
              name="country"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.country}
            />
            <TextField
              error={!!(formik.touched.iata && formik.errors.iata)}
              fullWidth
              helperText={formik.touched.iata && formik.errors.iata}
              label="Iata"
              name="iata"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.iata}
            />
            <TextField
              error={!!(formik.touched.icao && formik.errors.icao)}
              fullWidth
              helperText={formik.touched.icao && formik.errors.icao}
              label="Icao"
              name="icao"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.icao}
            />
            <TextField
              error={!!(formik.touched.lat && formik.errors.lat)}
              fullWidth
              helperText={formik.touched.lat && formik.errors.lat}
              label="Latitude"
              name="lat"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lat}
            />
            <TextField
              error={!!(formik.touched.lon && formik.errors.lon)}
              fullWidth
              helperText={formik.touched.lon && formik.errors.lon}
              label="Longitude"
              name="lon"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.lon}
            />
            <TextField
              error={!!(formik.touched.timezone && formik.errors.timezone)}
              fullWidth
              helperText={formik.touched.timezone && formik.errors.timezone}
              label="Timezone"
              name="timezone"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.timezone}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="airport-form" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AirportForm;
