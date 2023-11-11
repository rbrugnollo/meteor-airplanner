import React from 'react';
import { FlightEvent } from '/imports/api/events/collection';

interface FlightExtraContentProps {
  event: FlightEvent;
}

const FlightExtraContent = ({ event }: FlightExtraContentProps) => {
  return (
    <div>
      <div>Airplane: {event.flight?.airplane?.label}</div>
      <div>Captain: {event.flight?.captain?.label}</div>
      <div>First Officer: {event.flight?.firstOfficer?.label}</div>
      <div>Origin: {event.flight?.origin?.label}</div>
      <div>Destination: {event.flight?.destination?.label}</div>
      <div>Duration: {event.flight?.estimatedDuration}</div>
      <div>Passengers: {event.flight?.passengers?.map((m) => m.label).join(', ')}</div>
      <div>Notes: {event.flight.notes}</div>
    </div>
  );
};

export default FlightExtraContent;
