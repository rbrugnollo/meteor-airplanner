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
import { useFormik } from 'formik';
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
      name: Yup.string().required('Nome é obrigatório'),
      tailNumber: Yup.string().required('Registro é obrigatório'),
      seats: Yup.number().required('No de Assentos é obrigatório'),
      base: Yup.object().required('Base é obrigatório'),
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
      enqueueSnackbar('Aeronave criada com sucesso.', { variant: 'success' });
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
      enqueueSnackbar('Aeronave atualizada com sucesso.', { variant: 'success' });
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
      <DialogTitle>{airplaneId ? 'Editar' : 'Adicionar'} Aeronave</DialogTitle>
      <DialogContent>
        <form id="airplane-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              required
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Nome"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
            <TextField
              required
              error={!!(formik.touched.tailNumber && formik.errors.tailNumber)}
              fullWidth
              helperText={formik.touched.tailNumber && formik.errors.tailNumber}
              label="Registro"
              name="tailNumber"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.tailNumber}
            />
            <AirportSelect
              required
              fullWidth
              label="Base"
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
              required
              error={!!(formik.touched.icaoCode && formik.errors.icaoCode)}
              helperText={formik.touched.icaoCode && formik.errors.icaoCode}
              fullWidth
              label="Código ICAO"
              name="icaoCode"
              onBlur={(e) => {
                dvalidateIcaoCodeOnServer(e.target.value);
                formik.handleBlur(e);
              }}
              onChange={formik.handleChange}
              value={formik.values.icaoCode}
            />
            <TextField
              required
              error={!!(formik.touched.seats && formik.errors.seats)}
              fullWidth
              helperText={formik.touched.seats && formik.errors.seats}
              label="No de Assentos"
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
              label="Responsável"
              name="manager"
              roles={['Responsável Aeronave']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('manager', value);
              }}
              defaultValue={formik.initialValues.manager ?? null}
              value={formik.values.manager ?? null}
            />
            <UserSelect
              fullWidth
              label="Comandante"
              name="captain"
              roles={['Comandante']}
              onBlur={formik.handleBlur}
              onChange={(_e, value) => {
                formik.setFieldValue('captain', value);
              }}
              defaultValue={formik.initialValues.captain ?? null}
              value={formik.values.captain ?? null}
            />
            <UserSelect
              fullWidth
              label="Co-Piloto"
              name="firstOfficer"
              roles={['Co-Piloto']}
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
              label="Pilotos"
              name="pilots"
              roles={['Comandante', 'Co-Piloto']}
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
