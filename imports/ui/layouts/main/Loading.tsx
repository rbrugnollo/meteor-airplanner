import React from 'react';
import { Grid, CircularProgress, Stack, Typography } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <CircularProgress />
        <Typography variant="h5" component="h1">
          Loading...
        </Typography>
      </Stack>
    </Grid>
  );
};

export default LoadingSpinner;
