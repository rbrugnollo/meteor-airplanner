/* eslint-disable camelcase */
import React, { useEffect, useState, useRef } from 'react';
import { Scheduler } from '@aldabil/react-scheduler';
import { SchedulerRef, ProcessedEvent, RemoteQuery } from '@aldabil/react-scheduler/types';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getMany } from '/imports/api/events/methods/getMany';
import ScheduleFilter, { ScheduleFilterValues } from './ScheduleFilter';
import ScheduleForm from './ScheduleForm';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import { useSnackbar } from 'notistack';
import { remove } from '/imports/api/events/methods/delete';
import { Meteor } from 'meteor/meteor';

const Schedule = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [modalProps, setModalProps] = useState<{ open: boolean; eventId?: string }>({
    open: false,
    eventId: undefined,
  });
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
    const processedEvents: ProcessedEvent[] = events.map(({ _id, type, title, start, end }) => ({
      event_id: _id,
      title,
      start,
      end,
      editable: false,
      type,
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
                  <AuthorizedComponent permission="schedule.insert">
                    <Button
                      startIcon={<AddIcon />}
                      variant="contained"
                      onClick={() => setModalProps({ open: true, eventId: undefined })}
                    >
                      Add
                    </Button>
                  </AuthorizedComponent>
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
              viewerExtraComponent={(_fields, event) => {
                return event.type === 'Vacation' ? (
                  <div>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setModalProps({ open: true, eventId: event.event_id!.toString() })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={async () => {
                        try {
                          await remove({ _id: event.event_id!.toString() });
                          fetch(filters, remoteQuery);
                          enqueueSnackbar('Event successfully removed.', { variant: 'success' });
                        } catch (e: unknown) {
                          console.log(e);
                          if (e instanceof Meteor.Error) {
                            enqueueSnackbar(e.message, { variant: 'error' });
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ) : (
                  <span />
                );
              }}
              month={{
                weekDays: [0, 1, 2, 3, 4, 5, 6],
                weekStartOn: 0,
                navigation: true,
                startHour: 0,
                endHour: 24,
                disableGoToDay: true,
              }}
              week={{
                step: 60,
                weekDays: [0, 1, 2, 3, 4, 5, 6],
                weekStartOn: 0,
                navigation: true,
                startHour: 0,
                endHour: 24,
                disableGoToDay: true,
              }}
              day={null}
              getRemoteEvents={handleGetRemoteEvents}
            />
            <ScheduleForm
              {...modalProps}
              onClose={() => setModalProps({ open: false, eventId: undefined })}
              onSuccess={() => fetch(filters, remoteQuery)}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default Schedule;
