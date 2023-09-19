import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { Accounts } from 'meteor/accounts-base';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
    }),
    onSubmit: async (values, helpers) => {
      Accounts.forgotPassword({ email: values.email }, (error) => {
        if (error) {
          enqueueSnackbar(error.message, { variant: 'error' });
          helpers.setSubmitting(false);
        } else {
          enqueueSnackbar(`Please follow the instructions sent to ${values.email}.`, {
            variant: 'success',
          });
          navigate('/auth/login');
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
                Forgot Password
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
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
              </Stack>
              <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                Send Email
              </Button>
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                {...{
                  component: RouterLink,
                  to: '/auth/login',
                }}
              >
                Login
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default ForgotPasswordForm;
