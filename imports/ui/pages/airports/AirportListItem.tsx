import React, { memo } from 'react';
import { Tr, Td, ButtonGroup } from '@chakra-ui/react';
import AirportForm from './AirportForm';
import EditBtn from '../../shared/editBtn/EditBtn';

interface AirportViewModel {
  readonly _id: string;
  readonly name: string;
  readonly icao: string;
  readonly city: string;
  readonly country: string;
}

interface AirportListItemProps {
  readonly airport: AirportViewModel;
}

const AirportListItem = ({ airport }: AirportListItemProps) => (
  <Tr>
    <Td>
      ({airport.icao})&nbsp;{airport.name}
    </Td>
    <Td>
      {airport.city} - {airport.country}
    </Td>
    <Td isNumeric>
      <ButtonGroup gap={{ base: 0, md: 1 }}>
        <AirportForm
          airportId={airport._id}
          ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
        />
      </ButtonGroup>
    </Td>
  </Tr>
);

export default memo(AirportListItem);
