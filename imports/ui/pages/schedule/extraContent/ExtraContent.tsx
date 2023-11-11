import React from 'react';
import { Event } from '/imports/api/events/collection';
import VacationExtraContent from './VacationExtraContent';
import FlightExtraContent from './FlightExtraContent';

interface ExtraContentProps {
  event: Event;
  onDelete: (eventId: string) => void;
  onEdit: (eventId: string) => void;
}

const ExtraContent = ({ event, onDelete, onEdit }: ExtraContentProps) => {
  return event.type === 'Vacation' ? (
    <VacationExtraContent event={event} onDelete={onDelete} onEdit={onEdit} />
  ) : event.type === 'Flight' ? (
    <FlightExtraContent event={event} />
  ) : null;
};

export default ExtraContent;
