import React, { useState } from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
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
  const [_canReviewLoading] = useHasPermission('flights.review');
  const [andFilters, setAndFilters] = useState<
    NpmModuleMongodb.Filter<NpmModuleMongodb.WithId<Flight>>[]
  >([{ scheduledDepartureDateTime: { $gte: new Date() } }]);
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
    if (values.date) {
      selectors = [
        ...selectors,
        {
          scheduledDepartureDateTime: {
            $gte: values.date.toDate(),
            $lt: values.date.add(1, 'month').toDate(),
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
                  <FlightListFilter onFilter={handleFilter} />
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
