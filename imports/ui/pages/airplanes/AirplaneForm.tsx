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
import { debounce } from 'lodash';
import { FormikErrors, useFormik } from 'formik';
import { insert } from '/imports/api/airplanes/methods/insert';
import { update } from '/imports/api/airplanes/methods/update';
import { useSnackbar } from 'notistack';
import { Airplane, AirplanesCollection } from '/imports/api/airplanes/collection';
import { Meteor } from 'meteor/meteor';
import UserSelect from '../../shared/selects/UserSelect';
import { BaseCollectionTypes, Nullable } from '/imports/api/common/BaseCollection';
import AirportSelect from '../../shared/selects/AirportSelect';
import { validateIcaoCode } from '/imports/api/airplanes/methods/validateIcaoCode';
type AirplaneFormValues = Nullable<Omit<Airplane, BaseCollectionTypes>>;

interface AirplaneFormProps {
  readonly airplaneId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const AirplaneForm = ({ airplaneId, open, onClose }: AirplaneFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<AirplaneFormValues>({
    initialValues: {
      name: '',
      tailNumber: '',
      base: null,
      icaoCode: null,
      seats: 0,
      manager: null,
      captain: null,
      firstOfficer: null,
      pilots: [],
    },
    validationSchema: Yup.object<AirplaneFormValues>().shape({
      name: Yup.string().required('Name is required'),
      tailNumber: Yup.string().required('Tail Number is required'),
      seats: Yup.number().required('Seats is required'),
      base: Yup.object().required('Base Airport is required'),
    }),
    onSubmit: async (values) => {
      if (airplaneId) {
        await handleUpdate(values);
      } else {
        await handleInsert(values);
      }
    },
    enableReinitialize: true,
  });
  useEffect(() => {
    formik.resetForm();
    if (open && airplaneId) {
      const airplane = AirplanesCollection.findOne(airplaneId);
      if (airplane) {
        const { _id, ...values } = airplane;
        formik.setValues(values);
      }
    }
  }, [open]);

  const validateIcaoCodeOnServer = async (icaoCode: string) => {
    // Validate airplane Icao Code
    if (icaoCode) {
      const validateIcaoCodeError = await validateIcaoCode({ icaoCode });
      if (validateIcaoCodeError) {
        formik.setErrors({
          ...formik.errors,
          icaoCode: validateIcaoCodeError,
        });
      }
    }
  };

  const dvalidateIcaoCodeOnServer = debounce(validateIcaoCodeOnServer, 500);

  const handleInsert = async (data: AirplaneFormValues) => {
    try {
      const finalData = data as unknown as Omit<Airplane, BaseCollectionTypes>;
      await insert(finalData);
      enqueueSnackbar('Airplane successfully created.', { variant: 'success' });
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (data: AirplaneFormValues) => {
    try {
      const finalData = data as unknown as Omit<Airplane, BaseCollectionTypes>;
      await update({
        _id: airplaneId!,
        ...finalData,
      });
      enqueueSnackbar('Airplane successfully updated.', { variant: 'success' });
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
      <DialogTitle>{airplaneId ? 'Update' : 'Add new'} Airplane</DialogTitle>
      <DialogContent>
        <form id="airplane-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Name"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <TextField
              error={!!(formik.touched.tailNumber && formik.errors.tailNumber)}
              fullWidth
              helperText={formik.touched.tailNumber && formik.errors.tailNumber}
              label="Tail Number"
              name="tailNumber"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.tailNumber}
            />
            <AirportSelect
              fullWidth
              label="Base Airport"
              name="base"
              onBlur={formik.handleBlur}
              value={formik.values.base}
              onChange={(_e, value) => {
                formik.setFieldValue('base', value);
              }}
              error={!!(formik.touched.base && formik.errors.base)}
              helperText={formik.touched.base && formik.errors.base}
            />
            <TextField
              error={!!(formik.touched.icaoCode && formik.errors.icaoCode)}
              helperText={formik.touched.icaoCode && formik.errors.icaoCode}
              fullWidth
              label="Icao Code"
              name="icaoCode"
              onBlur={(e) => {
                dvalidateIcaoCodeOnServer(e.target.value);
                formik.handleBlur(e);
              }}
              onChange={formik.handleChange}
              value={formik.values.icaoCode}
            />
            <TextField
              error={!!(formik.touched.seats && formik.errors.seats)}
              fullWidth
              helperText={formik.touched.seats && formik.errors.seats}
              label="Seats"
              name="seats"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.seats}
            />
            <UserSelect
              fullWidth
              label="Manager"
              name="manager"
              roles={['Airplane Manager']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('manager', value);
              }}
              defaultValue={formik.initialValues.manager ?? null}
              value={formik.values.manager ?? null}
            />
            <UserSelect
              fullWidth
              label="Captain"
              name="captain"
              roles={['Captain']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('captain', value);
              }}
              defaultValue={formik.initialValues.captain ?? null}
              value={formik.values.captain ?? null}
            />
            <UserSelect
              fullWidth
              label="First Officer"
              name="firstOfficer"
              roles={['First Officer']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('firstOfficer', value);
              }}
              defaultValue={formik.initialValues.firstOfficer ?? null}
              value={formik.values.firstOfficer ?? null}
            />
            <UserSelect
              multiple
              fullWidth
              label="Pilots"
              name="pilots"
              roles={['Captain', 'First Officer']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('pilots', value);
              }}
              defaultValue={formik.initialValues.pilots ?? []}
              value={formik.values.pilots ?? []}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="airplane-form" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AirplaneForm;
