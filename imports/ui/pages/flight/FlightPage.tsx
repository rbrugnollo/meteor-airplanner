import React from 'react';
import { useMatch } from 'react-router-dom';
import { Box, Container, Stack, Typography } from '@mui/material';
import FlightDetails from './FlightDetails';
import FlightTimeline from './FlightTimeline';

const FlightPage = () => {
  const match = useMatch('app/flights/:id');
  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 0 },
          }}
        >
          <Stack spacing={2}>
            <Stack
              sx={{ px: { xs: 2 } }}
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Typography variant="h5">Detalhes de Vôo</Typography>
            </Stack>
            <Stack spacing={0}>
              <FlightDetails flightId={match?.params.id ?? ''} />
              <FlightTimeline flightId={match?.params.id ?? ''} />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default FlightPage;
