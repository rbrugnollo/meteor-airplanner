import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { Meteor } from 'meteor/meteor';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const LoginForm = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      submit: null,
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Email inválido').max(255).required('Email é obrigatório'),
      password: Yup.string().max(255).required('Senha é obrigatório'),
    }),
    onSubmit: async (values, helpers) => {
      Meteor.loginWithPassword(values.email, values.password, (error) => {
        if (error) {
          enqueueSnackbar(error.message, { variant: 'error' });
          helpers.setSubmitting(false);
        } else {
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
            >
              <img width={128} src="/logo.png" />
              <Typography fontWeight="bold" variant="h4">
                Entrar
              </Typography>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
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
                <TextField
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
                  label="Senha"
                  name="password"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="password"
                  value={formik.values.password}
                />
              </Stack>
              <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                Entrar
              </Button>
              <Button
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                {...{
                  component: RouterLink,
                  to: '/auth/forgot',
                }}
              >
                Esqueceu a senha?
              </Button>
            </form>
          </div>
        </Box>
      </Box>
    </>
  );
};

export default LoginForm;
