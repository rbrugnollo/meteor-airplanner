/* eslint-disable camelcase */
import React from 'react';
import { Scheduler } from '@aldabil/react-scheduler';
import { RoleName } from '/imports/api/users/collection';
import { Box, Container, Stack, Typography } from '@mui/material';

export const ScheduleRoles: RoleName[] = ['Admin', 'Captain', 'First Officer'];

const Schedule = () => {
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
              <Typography variant="h5">Schedule</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  {/* <AirportListFilter onFilter={handleFilter} /> */}
                </Stack>
              </div>
            </Stack>
            <Scheduler
              view="month"
              editable={false}
              draggable={false}
              deletable={false}
              month={{
                weekDays: [0, 1, 2, 3, 4, 5],
                weekStartOn: 6,
                navigation: true,
                startHour: 9,
                endHour: 17,
                disableGoToDay: true,
              }}
              day={null}
              week={null}
              events={[
                {
                  event_id: 1,
                  title: 'Event 1',
                  start: new Date('2021/5/2 09:30'),
                  end: new Date('2021/5/2 10:30'),
                },
                {
                  event_id: 2,
                  title: 'Event 2',
                  start: new Date('2021/5/4 10:00'),
                  end: new Date('2021/5/4 11:00'),
                },
              ]}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Schedule;
