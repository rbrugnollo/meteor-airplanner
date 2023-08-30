import React, { memo } from 'react';
import { Tr, Td, ButtonGroup } from '@chakra-ui/react';
import CostCenterForm from './CostCenterForm';
import EditBtn from '../../shared/editBtn/EditBtn';

interface CostCenterViewModel {
  readonly _id: string;
  readonly name: string;
}

interface CostCenterListItemProps {
  readonly costCenter: CostCenterViewModel;
}

const CostCenterListItem = ({ costCenter }: CostCenterListItemProps) => (
  <Tr>
    <Td>{costCenter.name}</Td>
    <Td isNumeric>
      <ButtonGroup gap={{ base: 0, md: 1 }}>
        <CostCenterForm
          costCenterId={costCenter._id}
          ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
        />
      </ButtonGroup>
    </Td>
  </Tr>
);

export default memo(CostCenterListItem);
