import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Flight } from '/imports/api/flights/collection';
// import { cancel } from '/imports/api/flights/methods/cancel';
import FlightDetailsExtraInfo from '../flight/FlightDetailsExtraInfo';
import FlightDetailsHeader from '../flight/FlightDetailsHeader';

interface FlightDetailsProps {
  readonly flight: Flight;
  readonly canUpdate: boolean;
  readonly canCancel: boolean;
  readonly onEdit: (flightId: string) => void;
  readonly onReview: (flightId: string) => void;
  readonly onViewRoute: (flightGroupId: string) => void;
}

const FlightDetails = ({ flight, onEdit, onViewRoute }: FlightDetailsProps) => {
  return (
    <Accordion>
      <AccordionSummary>
        <FlightDetailsHeader onEdit={onEdit} onViewRoute={onViewRoute} flight={flight} />
      </AccordionSummary>
      <AccordionDetails>
        <FlightDetailsExtraInfo flight={flight} />
      </AccordionDetails>
    </Accordion>
  );
};

export default FlightDetails;
