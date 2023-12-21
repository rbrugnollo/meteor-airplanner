import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Stack, Typography } from '@mui/material';
import FlightDetails from './FlightDetails';
import FlightTimeline from './FlightTimeline';
import { useQuery } from '../../shared/hooks/useQuery';
import { debounce } from 'lodash';
import { toggleRead } from '/imports/api/notifications/methods/toggleRead';

const handleSetAsRead = (notificationId?: string | null) => {
  if (!notificationId) return;
  toggleRead({ _id: notificationId, read: true });
};

const dhandleSetAsRead = debounce(handleSetAsRead, 500);

const FlightPage = () => {
  const { id } = useParams();
  const query = useQuery();

  useEffect(() => {
    dhandleSetAsRead(query.get('notificationId'));
  }, []);

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
              <FlightDetails flightId={id ?? ''} />
              <FlightTimeline flightId={id ?? ''} />
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default FlightPage;
