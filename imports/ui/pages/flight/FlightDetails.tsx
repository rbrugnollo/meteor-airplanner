import React, { useState } from 'react';
import { useFind, useSubscribe } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/flights/publications/list';
import { FlightsCollection } from '/imports/api/flights/collection';
import FlightDetailsHeader from './FlightDetailsHeader';
import FlightDetailsExtraInfo from './FlightDetailsExtraInfo';
import FlightForm from '../flights/FlightForm';
import FlightRouteModal from '../flights/FlightRouteModal';

interface FlightDetailsProps {
  readonly flightId: string;
}

const FlightDetails = ({ flightId }: FlightDetailsProps) => {
  const [formModalProps, setFormModalProps] = useState<{ open: boolean; flightId?: string }>({
    open: false,
    flightId: undefined,
  });
  const [routeModalProps, setRouteModalProps] = useState<{ open: boolean; flightGroupId?: string }>(
    {
      open: false,
      flightGroupId: undefined,
    },
  );
  useSubscribe(() => {
    return list({ andFilters: [{ _id: flightId }], options: { limit: 1 } });
  });
  const flights = useFind(
    () =>
      FlightsCollection.find(
        { _id: flightId },
        {
          limit: 1,
        },
      ),
    [],
  );

  const flight = flights.length ? flights[0] : null;

  return (
    flight && (
      <div>
        <FlightDetailsHeader
          onEdit={(flightId) => setFormModalProps({ open: true, flightId })}
          onViewRoute={(flightGroupId) => setRouteModalProps({ open: true, flightGroupId })}
          flight={flight}
        />
        <FlightDetailsExtraInfo flight={flight} />
        <FlightForm
          {...formModalProps}
          onClose={() => setFormModalProps({ open: false, flightId: undefined })}
        />
        <FlightRouteModal
          {...routeModalProps}
          onClose={() => setRouteModalProps({ open: false, flightGroupId: undefined })}
        />
      </div>
    )
  );
};

export default FlightDetails;
