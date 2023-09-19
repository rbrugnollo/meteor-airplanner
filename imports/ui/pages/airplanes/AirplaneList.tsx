import React, { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef as MrtColumnDef } from 'material-react-table';
import { Box, Button, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/airplanes/publications/list';
import { RoleName } from '/imports/api/users/collection';
import { Airplane, AirplanesCollection } from '/imports/api/airplanes/collection';

export const AirplaneListRoles: RoleName[] = ['Admin'];

const AirplaneList = () => {
  const isLoading = useSubscribe(list);
  const airplanes = useFind(() => AirplanesCollection.find());
  const columns = useMemo<MrtColumnDef<Airplane>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'tailNumber',
        header: 'Tail Number',
      },
      {
        accessorKey: 'seats',
        header: 'Seats',
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
              <Typography variant="h5">Airplanes</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <Button startIcon={<AddIcon />} variant="contained">
                    Add
                  </Button>
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Airplane>
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
              data={airplanes}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default AirplaneList;
