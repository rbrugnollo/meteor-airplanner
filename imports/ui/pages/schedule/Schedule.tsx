/* eslint-disable camelcase */
import React from 'react';
import { Scheduler } from '@aldabil/react-scheduler';
import { ProcessedEvent, RemoteQuery } from '@aldabil/react-scheduler/types';
import { RoleName } from '/imports/api/users/collection';
import { Box, Container, Stack, Typography } from '@mui/material';
import { getMany } from '/imports/api/events/methods/getMany';

export const ScheduleRoles: RoleName[] = ['Admin', 'Captain', 'First Officer'];

const Schedule = () => {
  const fetch = async (params: RemoteQuery): Promise<ProcessedEvent[]> => {
    const events = await getMany({ from: params.start, to: params.end });
    return events.map(({ _id, title, start, end }) => ({
      event_id: _id,
      title,
      start,
      end,
    }));
  };

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
              getRemoteEvents={fetch}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Schedule;
