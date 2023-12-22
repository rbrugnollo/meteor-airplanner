import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import dayjs from 'dayjs';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/flights/publications/list';
import { Flight, FlightsCollection } from '/imports/api/flights/collection';
import FlightListFilter, { FlightListFilterValues } from './FlightListFilter';
import { Mongo } from 'meteor/mongo';
import { NpmModuleMongodb } from 'meteor/npm-mongo';
import FlightForm from './FlightForm';
import FlightRouteModal from './FlightRouteModal';
import AuthorizedComponent from '/imports/startup/client/router/AuthorizedComponent';
import ReviewFlightForm from './ReviewFlightForm';
import FlightDetails from './FlightDetails';
import { hasPermission } from '/imports/api/users/methods/hasPermission';

const FlightList = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canCancel, setCanCancel] = useState(false);
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
  const [andFilters, setAndFilters] = useState<
    NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>[]
  >([
    {
      scheduledDepartureDateTime: {
        $gte: dayjs(new Date()).startOf('day').toDate(),
        $lt: dayjs(new Date()).add(3, 'days').toDate(),
      },
    },
  ]);
  // Verify Permissions
  useEffect(() => {
    if (isLoaded) return;
    setIsLoaded(true);
    hasPermission({ permission: 'flights.update' }).then((hasPermission) => {
      setCanUpdate(hasPermission);
    });
    hasPermission({ permission: 'flights.cancel' }).then((hasPermission) => {
      setCanCancel(hasPermission);
    });
  }, []);
  const [options] = useState<Mongo.Options<Flight>>({
    sort: { scheduledDepartureDateTime: 1 },
  });
  useSubscribe(() => {
    return list({ andFilters, options });
  });
  const flights = useFind(
    () => FlightsCollection.find(andFilters.length ? { $and: andFilters } : {}, options),
    [andFilters, options],
  );

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
    if (values.dateFrom) {
      selectors = [
        ...selectors,
        {
          scheduledDepartureDateTime: {
            $gte: values.dateFrom.toDate(),
            $lt: values.dateTo ? values.dateTo.toDate() : values.dateFrom.add(1, 'month').toDate(),
          },
        },
      ];
    } else {
      selectors = [...selectors, { scheduledDepartureDateTime: { $gte: new Date() } }];
    }

    if (selectors.length === 0) {
      setAndFilters([]);
    } else {
      setAndFilters(selectors);
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
                  <FlightListFilter
                    initialValues={{
                      airplane: null,
                      dateFrom: dayjs(new Date()).startOf('day'),
                      dateTo: dayjs(new Date()).add(3, 'days').startOf('day'),
                    }}
                    onFilter={handleFilter}
                  />
                </Stack>
              </div>
            </Stack>
            <div>
              {flights.map((flight) => (
                <FlightDetails
                  key={flight._id}
                  canUpdate={canUpdate}
                  canCancel={canCancel}
                  onViewRoute={(flightGroupId) => setRouteModalProps({ open: true, flightGroupId })}
                  onEdit={(flightId) => setFormModalProps({ open: true, flightId })}
                  onReview={(flightId) => setReviewFormModalProps({ open: true, flightId })}
                  flight={flight}
                />
              ))}
            </div>
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
