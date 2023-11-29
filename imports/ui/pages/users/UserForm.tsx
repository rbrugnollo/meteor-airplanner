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
  Autocomplete,
  TextField,
  Stack,
} from '@mui/material';
import { useFormik } from 'formik';
import { RoleNames } from '/imports/api/users/collection';
import { insert } from '/imports/api/users/methods/insert';
import { update } from '/imports/api/users/methods/update';
import { Meteor } from 'meteor/meteor';
import { useSnackbar } from 'notistack';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import AirportSelect from '../../shared/selects/AirportSelect';
import { intersection } from 'lodash';

export interface UserFormValues {
  name: string;
  email: string;
  roles: string[];
  base?: ValueLabelType | null;
}

export interface UserFormProps {
  readonly userId?: string;
  readonly newUser?: UserFormValues;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (userId: string) => void;
}

const isPilot = (roles: string[]) =>
  intersection(roles, [RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER]).length > 0;

const UserForm = ({ userId, newUser, open, onClose, onSuccess }: UserFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<UserFormValues>({
    initialValues: {
      roles: [] as string[],
      name: '',
      email: '',
      base: null,
    },
    validationSchema: Yup.object({
      roles: Yup.array().of(Yup.string()),
      name: Yup.string().required('Nome é obrigatório'),
      email: Yup.string().email('Email inválido').required('Email é obrigatório'),
      base: Yup.object().when('roles', ([val], schema) =>
        isPilot(val) ? schema.required('Base é obrigatório') : schema.nullable().optional(),
      ),
    }),
    onSubmit: async (values) => {
      if (userId) {
        await handleUpdate(values);
      } else {
        await handleInsert(values);
      }
    },
    enableReinitialize: true,
  });
  useEffect(() => {
    if (!isPilot(formik.values.roles)) {
      formik.setFieldValue('base', null);
    }
  }, [formik.values.roles]);
  useEffect(() => {
    formik.resetForm();
    if (open) {
      if (userId) {
        const user = Meteor.users.findOne(userId);
        if (user) {
          formik.setValues({
            name: user.profile?.name ?? '',
            email: user.emails?.[0].address ?? '',
            roles: user.profile?.roles ?? [],
            base: user.profile?.base ?? null,
          });
        }
      }
      if (newUser) {
        formik.setValues(newUser);
      }
    }
  }, [open]);

  const handleInsert = async (data: UserFormValues) => {
    try {
      const userId = await insert({ ...data, base: data.base ?? undefined });
      enqueueSnackbar('Usuário criado com sucesso.', { variant: 'success' });
      onSuccess(userId);
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Meteor.Error) {
        enqueueSnackbar(e.message, { variant: 'error' });
      }
    }
  };

  const handleUpdate = async (data: UserFormValues) => {
    try {
      await update({
        _id: userId!,
        ...data,
        base: data.base ?? undefined,
      });
      enqueueSnackbar('Usuário atualizado com sucesso.', { variant: 'success' });
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
      <DialogTitle>{userId ? 'Editar' : 'Adicionar'} Usuário</DialogTitle>
      <DialogContent>
        <form id="user-form" noValidate onSubmit={formik.handleSubmit}>
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
              error={!!(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email"
              name="email"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="email"
              value={formik.values.email}
            />
            <Autocomplete
              multiple
              onBlur={formik.handleBlur}
              defaultValue={formik.initialValues.roles}
              onChange={(_e, value) => {
                formik.setFieldValue('roles', value);
              }}
              value={formik.values.roles}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              options={Object.entries(RoleNames).map(([_, roleName]) => roleName)}
              renderInput={(params) => <TextField name="roles" {...params} label="Funções" />}
            />
            <AirportSelect
              fullWidth
              label="Base"
              name="base"
              disabled={!isPilot(formik.values.roles)}
              onBlur={formik.handleBlur}
              value={formik.values.base}
              onChange={(_e, value) => {
                formik.setFieldValue('base', value);
              }}
              error={!!(formik.touched.base && formik.errors.base)}
              helperText={formik.touched.base && formik.errors.base}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button type="submit" form="user-form" autoFocus variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
