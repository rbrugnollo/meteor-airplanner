import React, { useMemo, useRef, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef as MrtColumnDef,
  MRT_Virtualizer as MrtVirtualizer,
} from 'material-react-table';
import { Box, Button, Container, Stack, Typography, useMediaQuery, Theme } from '@mui/material';
import dayjs from 'dayjs';
import { Add } from '@mui/icons-material';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/flights/publications/list';
import { Flight, FlightsCollection } from '/imports/api/flights/collection';
import FlightListFilter, { FlightListFilterValues } from './FlightListFilter';
import { Mongo } from 'meteor/mongo';
import { NpmModuleMongodb } from 'meteor/npm-mongo';
import FlightForm from './FlightForm';
import FlightRouteModal from './FlightRouteModal';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import useHasPermission from '../../shared/hooks/useHasPermission';
import ReviewFlightForm from './ReviewFlightForm';
import FlightDetails from './FlightDetails';

const FlightList = () => {
  const [formModalProps, setFormModalProps] = useState<{ open: boolean; flightId?: string }>({
    open: false,
    flightId: undefined,
  });
  const [reviewFormModalProps, setReviewFormModalProps] = useState<{
    open: boolean;
    flightId?: string;
  }>({
    open: false,
    flightId: undefined,
  });
  const [routeModalProps, setRouteModalProps] = useState<{ open: boolean; flightGroupId?: string }>(
    {
      open: false,
      flightGroupId: undefined,
    },
  );
  const [_canUpdateLoading, canUpdate] = useHasPermission('flights.update');
  const [_canRemoveLoading, canCancel] = useHasPermission('flights.cancel');
  const [_canReviewLoading, canReview] = useHasPermission('flights.review');
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const rowVirtualizerInstanceRef =
    useRef<MrtVirtualizer<HTMLDivElement, HTMLTableRowElement>>(null);
  const [andFilters, setAndFilters] = useState<
    NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>[]
  >([]);
  const [options, setOptions] = useState<Mongo.Options<Flight>>({
    sort: { scheduledDepartureDateTime: -1 },
    limit: 50,
  });
  const isLoading = useSubscribe(() => {
    return list({ andFilters, options });
  });
  const flights = useFind(
    () => FlightsCollection.find(andFilters.length ? { $and: andFilters } : {}, options),
    [andFilters, options],
  );
  const columns = useMemo<MrtColumnDef<Flight>[]>(
    () => [
      {
        accessorKey: 'scheduledDepartureDateTime',
        header: 'Data',
        accessorFn: (row) =>
          row.scheduledDepartureDateTime
            ? dayjs(row.scheduledDepartureDateTime).format('L LT')
            : '',
      },
      {
        accessorKey: 'airplane.label',
        header: 'Aeronave',
      },
      {
        accessorKey: 'origin.label',
        header: 'Origem',
      },
      {
        accessorKey: 'destination.label',
        header: 'Destino',
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

  const handleFilter = (values: FlightListFilterValues) => {
    let selectors: NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>[] = [];
    if (values.search) {
      selectors = [
        ...selectors,
        {
          $or: [
            { 'airplane.label': { $regex: values.search, $options: 'i' } },
            { 'origin.label': { $regex: values.search, $options: 'i' } },
            { 'destination.label': { $regex: values.search, $options: 'i' } },
          ],
        },
      ];
    }
    if (values.airplane) {
      selectors = [...selectors, { 'airplane.value': values.airplane.value }];
    }
    if (values.date) {
      selectors = [
        ...selectors,
        {
          scheduledDepartureDateTime: {
            $gte: values.date.toDate(),
            $lt: new Date(values.date.toDate().getTime() + 24 * 60 * 60 * 1000),
          },
        },
      ];
    }

    if (selectors.length === 0) {
      setAndFilters([]);
    } else {
      setAndFilters(selectors);
    }

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
              <Typography variant="h5">Vôos Agendados</Typography>
              <div>
                <Stack direction="row" spacing={2}>
                  <AuthorizedComponent permission="flights.insert">
                    <Button
                      startIcon={<Add />}
                      onClick={() => setFormModalProps({ open: true, flightId: undefined })}
                      variant="contained"
                    >
                      Adicionar
                    </Button>
                  </AuthorizedComponent>
                  <FlightListFilter onFilter={handleFilter} />
                </Stack>
              </div>
            </Stack>
            <MaterialReactTable<Flight>
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
              data={flights}
              muiTableContainerProps={{
                ref: tableContainerRef,
                sx: { maxHeight: lgUp ? 'calc(100vh - 90px)' : 'calc(100vh - 130px)' },
                onScroll: (event: React.UIEvent<HTMLDivElement>) =>
                  fetchMoreOnBottomReached(event.target as HTMLDivElement),
              }}
              renderDetailPanel={({ row }) => (
                <FlightDetails
                  canUpdate={canUpdate}
                  canCancel={canCancel}
                  onViewRoute={(flightGroupId) => setRouteModalProps({ open: true, flightGroupId })}
                  onEdit={(flightId) => setFormModalProps({ open: true, flightId })}
                  flight={row.original}
                />
              )}
            />
          </Stack>
        </Container>
        <FlightForm
          {...formModalProps}
          onClose={() => setFormModalProps({ open: false, flightId: undefined })}
        />
        <ReviewFlightForm
          {...reviewFormModalProps}
          onClose={() => setReviewFormModalProps({ open: false, flightId: undefined })}
        />
        <FlightRouteModal
          {...routeModalProps}
          onClose={() => setRouteModalProps({ open: false, flightGroupId: undefined })}
        />
      </Box>
    </>
  );
};

export default FlightList;
