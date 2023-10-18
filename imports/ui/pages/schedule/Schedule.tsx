/* eslint-disable camelcase */
import React, { useEffect, useRef } from 'react';
import { Scheduler } from '@aldabil/react-scheduler';
import { SchedulerRef, ProcessedEvent, RemoteQuery } from '@aldabil/react-scheduler/types';
import { RoleName } from '/imports/api/users/collection';
import { Box, Container, Stack, Typography } from '@mui/material';
import { getMany } from '/imports/api/events/methods/getMany';
import ScheduleFilter, { ScheduleFilterValues } from './ScheduleFilter';

export const ScheduleRoles: RoleName[] = ['Admin', 'Captain', 'First Officer'];

const Schedule = () => {
  const [remoteQuery, setRemoteQuery] = React.useState<RemoteQuery>();
  const [filters, setFilters] = React.useState<ScheduleFilterValues>({
    airplanes: [],
    pilots: [],
  });

  const calendarRef = useRef<SchedulerRef>(null);

  useEffect(() => {
    fetch(filters, remoteQuery);
  }, [remoteQuery, filters]);

  const fetch = async (filters: ScheduleFilterValues, params?: RemoteQuery) => {
    if (!params) return;

    calendarRef?.current?.scheduler?.handleState(true, 'loading');

    const { start: from, end: to } = params;
    const { pilots, airplanes } = filters;

    const events = await getMany({
      from,
      to,
      pilots: pilots.map((m) => m.value),
      airplanes: airplanes.map((m) => m.value),
    });
    const processedEvents: ProcessedEvent[] = events.map(({ _id, title, start, end }) => ({
      event_id: _id,
      title,
      start,
      end,
    }));
    calendarRef?.current?.scheduler?.handleState(processedEvents, 'events');
    calendarRef?.current?.scheduler?.handleState(false, 'loading');
  };

  const handleGetRemoteEvents = async (params: RemoteQuery): Promise<ProcessedEvent[]> => {
    setRemoteQuery(params);
    return new Promise((res) => {
      res([]);
    });
  };

  const handleFilter = (values: ScheduleFilterValues) => {
    setFilters(values);
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
                  <ScheduleFilter onFilter={handleFilter} />
                </Stack>
              </div>
            </Stack>
            <Scheduler
              ref={calendarRef}
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
              getRemoteEvents={handleGetRemoteEvents}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Schedule;
