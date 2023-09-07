import React, { memo } from 'react';
import { Tr, Td, ButtonGroup } from '@chakra-ui/react';
import EditBtn from '../../shared/editBtn/EditBtn';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import FlightForm from './FlightForm';

interface FlightViewModel {
  readonly _id: string;
  readonly airplane: ValueLabelType;
  readonly scheduledDateTime: Date;
}

interface FlightScheduleListItemProps {
  readonly flight: FlightViewModel;
}

const FlightScheduleListItem = ({ flight }: FlightScheduleListItemProps) => (
  <Tr>
    <Td>{flight.airplane.label}</Td>
    <Td>{flight.scheduledDateTime.toDateString()}</Td>
    <Td isNumeric>
      <ButtonGroup gap={{ base: 0, md: 1 }}>
        <FlightForm
          flightId={flight._id}
          ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
        />
      </ButtonGroup>
    </Td>
  </Tr>
);

export default memo(FlightScheduleListItem);
