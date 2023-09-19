import React, { useMemo } from 'react';
import { MaterialReactTable, type MRT_ColumnDef as MrtColumnDef } from 'material-react-table';
import { Box, Button, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/costCenters/publications/list';
import { RoleName } from '/imports/api/users/collection';
import { CostCenter, CostCentersCollection } from '/imports/api/costCenters/collection';

export const CostCenterListRoles: RoleName[] = ['Admin'];

const CostCenterList = () => {
  const isLoading = useSubscribe(list);
  const costCenters = useFind(() => CostCentersCollection.find());
  const columns = useMemo<MrtColumnDef<CostCenter>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
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
              <Typography variant="h5">Cost Centers</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <Button startIcon={<AddIcon />} variant="contained">
                    Add
                  </Button>
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<CostCenter>
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
              data={costCenters}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default CostCenterList;
