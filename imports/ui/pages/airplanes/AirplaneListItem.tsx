import React, { memo } from 'react';
import { Tr, Td, ButtonGroup } from '@chakra-ui/react';
import AirplaneForm from './AirplaneForm';
import EditBtn from '../../shared/editBtn/EditBtn';

interface AirplaneViewModel {
  readonly _id: string;
  readonly name: string;
  readonly tailNumber: string;
}

interface AirplaneListItemProps {
  readonly airplane: AirplaneViewModel;
}

const AirplaneListItem = ({ airplane }: AirplaneListItemProps) => (
  <Tr>
    <Td>{airplane.name}</Td>
    <Td>{airplane.tailNumber}</Td>
    <Td isNumeric>
      <ButtonGroup gap={{ base: 0, md: 1 }}>
        <AirplaneForm
          airplaneId={airplane._id}
          ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
        />
      </ButtonGroup>
    </Td>
  </Tr>
);

export default memo(AirplaneListItem);
