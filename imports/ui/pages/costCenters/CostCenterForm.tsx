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
import { insert } from '/imports/api/costCenters/methods/insert';
import { update } from '/imports/api/costCenters/methods/update';
import { useSnackbar } from 'notistack';
import { CostCenter, CostCentersCollection } from '/imports/api/costCenters/collection';
import { Meteor } from 'meteor/meteor';
import { BaseCollectionTypes } from '/imports/api/common/BaseCollection';

type CostCenterFormValues = Omit<CostCenter, BaseCollectionTypes>;

interface CostCenterFormProps {
  readonly costCenterId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const CostCenterForm = ({ costCenterId, open, onClose }: CostCenterFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<CostCenterFormValues>({
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object<CostCenterFormValues>().shape({
      name: Yup.string().required('Nome é obrigatório'),
    }),
    onSubmit: async (values) => {
      if (costCenterId) {
        await handleUpdate(values);
      } else {
        await handleInsert(values);
      }
    },
    enableReinitialize: true,
  });
  useEffect(() => {
    formik.resetForm();
    if (open && costCenterId) {
      const costCenter = CostCentersCollection.findOne(costCenterId);
      if (costCenter) {
        const { _id, ...values } = costCenter;
        formik.setValues(values);
      }
    }
  }, [open]);

  const handleInsert = async (data: CostCenterFormValues) => {
    try {
      await insert(data);
      enqueueSnackbar('Centro de Custo criado com sucesso.', { variant: 'success' });
      onClose();
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (data: CostCenterFormValues) => {
    try {
      await update({
        _id: costCenterId!,
        ...data,
      });
      enqueueSnackbar('Centro de Custo atualizado com sucesso.', { variant: 'success' });
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
      <DialogTitle>{costCenterId ? 'Editar' : 'Adicionar'} Centro de Custo</DialogTitle>
      <DialogContent>
        <form id="costCenter-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Nome"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              value={formik.values.name}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="costCenter-form" autoFocus variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CostCenterForm;
