import { Tooltip, IconButton } from '@chakra-ui/react';
import React from 'react';
import { FaPenToSquare } from 'react-icons/fa6';

interface EditBtnProps {
  readonly onClick: () => void;
}

const EditBtn = ({ onClick }: EditBtnProps) => (
  <Tooltip label="Edit">
    <IconButton
      size={{ base: 'sm', md: 'md' }}
      aria-label="Edit"
      icon={<FaPenToSquare />}
      colorScheme="teal"
      onClick={onClick}
    />
  </Tooltip>
);

export default EditBtn;
