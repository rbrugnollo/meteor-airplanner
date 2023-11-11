import React from 'react';
import { Button } from '@mui/material';
import { Event } from '/imports/api/events/collection';

interface VacationExtraContentProps {
  event: Event;
  onDelete: (eventId: string) => void;
  onEdit: (eventId: string) => void;
}

const VacationExtraContent = ({ event, onEdit, onDelete }: VacationExtraContentProps) => {
  return (
    <div>
      <Button variant="outlined" onClick={() => onEdit(event._id!)}>
        Edit
      </Button>
      <Button variant="outlined" onClick={() => onDelete(event._id!)}>
        Delete
      </Button>
    </div>
  );
};

export default VacationExtraContent;
