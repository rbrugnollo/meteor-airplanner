import React, { useMemo, useRef, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef as MrtColumnDef,
  MRT_Virtualizer as MrtVirtualizer,
} from 'material-react-table';
import { Box, Button, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { RoleName } from '/imports/api/users/collection';
import { list } from '/imports/api/airports/publications/list';
import { Airport, AirportsCollection } from '/imports/api/airports/collection';
import AirportListFilter, { AirportListFilterValues } from './AirportListFilter';
import { Mongo } from 'meteor/mongo';

export const AirportListRoles: RoleName[] = ['Admin'];

const AirportList = () => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MrtVirtualizer<HTMLDivElement, HTMLTableRowElement>>(null);
  const [selector, setSelector] = useState<Mongo.Selector<Airport>>({ role: null });
  const [options, setOptions] = useState<Mongo.Options<Airport>>({ sort: { name: 1 }, limit: 50 });
  const isLoading = useSubscribe(() => {
    return list({ selector, options });
  });
  const airports = useFind(() => AirportsCollection.find(), [selector, options]);
  const columns = useMemo<MrtColumnDef<Airport>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'icao',
        header: 'ICAO',
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
      {
        accessorKey: 'country',
        header: 'Country',
      },
      {
        accessorKey: 'timezone',
        header: 'Timezone',
      },
    ],
    [],
  );
  const lgUp = useMediaQuery<Theme>((theme) => theme.breakpoints.up('lg'));

  const fetchMoreOnBottomReached = (containerRefElement?: HTMLDivElement | null) => {
    if (containerRefElement) {
      const currentLimit = options?.limit ?? 0;
      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      if (scrollHeight - scrollTop - clientHeight < 400 && !isLoading() && currentLimit < 500) {
        setOptions({ ...options, limit: currentLimit + 50 });
      }
    }
  };

  const handleFilter = (values: AirportListFilterValues) => {
    let selector = {};
    if (values.search) {
      selector = {
        $or: [
          { name: { $regex: values.search, $options: 'i' } },
          { city: { $regex: values.search, $options: 'i' } },
          { icao: { $regex: values.search, $options: 'i' } },
        ],
      };
    }
    setSelector(selector);
    // Scroll to the top of the table when the filter changes
    try {
      rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
    } catch (error) {
      console.error(error);
    }
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
              <Typography variant="h5">Airports</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <Button startIcon={<AddIcon />} variant="contained">
                    Add
                  </Button>
                  <AirportListFilter onFilter={handleFilter} />
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Airport>
              enablePagination={false}
              enableTopToolbar={false}
              enableBottomToolbar={false}
              enableDensityToggle={false}
              enableSorting={false}
              enableFilters={false}
              enableHiding={false}
              enableColumnActions={false}
              enableRowVirtualization
              rowVirtualizerProps={{ overscan: 4 }}
              rowVirtualizerInstanceRef={rowVirtualizerInstanceRef}
              state={{
                isLoading: isLoading(),
                columnVisibility: { icao: lgUp, country: lgUp, timezone: lgUp },
              }}
              muiTablePaperProps={lgUp ? {} : { elevation: 0 }}
              columns={columns}
              data={airports}
              muiTableContainerProps={{
                ref: tableContainerRef,
                sx: { maxHeight: lgUp ? 'calc(100vh - 90px)' : 'calc(100vh - 130px)' },
                onScroll: (event: React.UIEvent<HTMLDivElement>) =>
                  fetchMoreOnBottomReached(event.target as HTMLDivElement),
              }}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default AirportList;
