import React, { SyntheticEvent, useEffect } from 'react';
import * as Yup from 'yup';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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

interface UserFormValues {
  name: string;
  email: string;
  roles: string[];
}

interface UserFormProps {
  readonly userId?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}

const UserForm = ({ userId, open, onClose }: UserFormProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const fullScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const formik = useFormik<UserFormValues>({
    initialValues: {
      roles: [] as string[],
      name: '',
      email: '',
    },
    validationSchema: Yup.object({
      roles: Yup.array().of(Yup.string()),
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Must be a valid email').required('Email is required'),
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
    formik.resetForm();
    if (open && userId) {
      const user = Meteor.users.findOne(userId);
      if (user) {
        formik.setValues({
          name: user.profile?.name ?? '',
          email: user.emails?.[0].address ?? '',
          roles: user.profile?.roles ?? [],
        });
      }
    }
  }, [open]);

  const handleInsert = async (data: UserFormValues) => {
    try {
      await insert(data);
      enqueueSnackbar('User successfully created.', { variant: 'success' });
      onClose();
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
      });
      enqueueSnackbar('User successfully updated.', { variant: 'success' });
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
      <DialogTitle>{userId ? 'Update' : 'Add new'} User</DialogTitle>
      <DialogContent>
        <form id="user-form" noValidate onSubmit={formik.handleSubmit}>
          <Stack sx={{ mt: 1 }} spacing={3}>
            <TextField
              error={!!(formik.touched.name && formik.errors.name)}
              fullWidth
              helperText={formik.touched.name && formik.errors.name}
              label="Name"
              name="name"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              type="name"
              value={formik.values.name}
            />
            <TextField
              error={!!(formik.touched.email && formik.errors.email)}
              fullWidth
              helperText={formik.touched.email && formik.errors.email}
              label="Email Address"
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
              onChange={(_e: SyntheticEvent, value: readonly string[]) => {
                formik.setFieldValue('roles', value);
              }}
              value={formik.values.roles}
              disableCloseOnSelect
              getOptionLabel={(option) => option}
              options={Object.entries(RoleNames).map(([_, roleName]) => roleName)}
              renderInput={(params) => <TextField name="roles" {...params} label="Roles" />}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="user-form" autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserForm;
