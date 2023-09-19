import React, { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef as MrtColumnDef } from 'material-react-table';
import { Box, Button, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { RoleName } from '/imports/api/users/collection';
import { Flight, FlightsCollection } from '/imports/api/flights/collection';
import { list } from '/imports/api/flights/publications/list';

export const FlightScheduleListRoles: RoleName[] = ['Admin'];

const FlightScheduleList = () => {
  const isLoading = useSubscribe(list);
  const flights = useFind(() => FlightsCollection.find({}));
  const columns = useMemo<MrtColumnDef<Flight>[]>(
    () => [
      {
        accessorKey: 'airplane.label',
        header: 'Airplane',
      },
      {
        accessorKey: 'scheduledDateTime',
        header: 'Scheduled Date',
        accessorFn: (row) => row.scheduledDateTime.toDateString(),
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

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
              <Typography variant="h5">Flight Schedule</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <Button startIcon={<AddIcon />} variant="contained">
                    Add
                  </Button>
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Flight>
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableDensityToggle={false}
              enableSorting={false}
              enableFilters={false}
              enableHiding={false}
              enableColumnActions={false}
              enableRowVirtualization
              state={{ isLoading: isLoading() }}
              muiTablePaperProps={lgUp ? {} : { elevation: 0 }}
              columns={columns}
              data={flights}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default FlightScheduleList;
