import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { Accounts } from 'meteor/accounts-base';
import { useMatch, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const getCharacterValidationError = (str: string) => {
  return `Your password must have at least 1 ${str} character`;
};

const ForgotPasswordForm = () => {
  const match = useMatch('auth/password/:action/:token');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      password: '',
      confirm: '',
      submit: null,
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .max(255)
        .required('Password is required')
        .matches(/[0-9]/, getCharacterValidationError('digit'))
        .matches(/[a-z]/, getCharacterValidationError('lowercase'))
        .matches(/[A-Z]/, getCharacterValidationError('uppercase')),
      confirm: Yup.string()
        .max(255)
        .required('Confirm is required')
        .oneOf([Yup.ref('password')], 'Passwords does not match'),
    }),
    onSubmit: async (values, helpers) => {
      const token = match?.params.token ?? '';
      console.log('token', token);
      Accounts.resetPassword(token, values.password, function (err) {
        if (err) {
          enqueueSnackbar(err.message, { variant: 'error' });
          helpers.setSubmitting(false);
        } else {
          enqueueSnackbar('Password successfully defined', {
            variant: 'success',
          });
          navigate('/app');
        }
      });
    },
  });

  return (
    <>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            maxWidth: 550,
            px: 3,
            py: '100px',
            width: '100%',
          }}
        >
          <div>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              style={{ marginBottom: '40px' }}
              alignItems="center"
            >
              <img style={{ maxWidth: 128, height: '100%' }} src="/logo.png" />
              <Typography fontWeight="bold" variant="h4">
                {match?.params.action == 'enroll-account' ? 'Set' : 'Reset'} Password
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Password"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
                <TextField
                  error={!!(formik.touched.confirm && formik.errors.confirm)}
                  fullWidth
                  helperText={formik.touched.confirm && formik.errors.confirm}
                  label="Confirm Password"
                  name="confirm"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.confirm}
                />
              </Stack>
              <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                Continue
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default ForgotPasswordForm;
