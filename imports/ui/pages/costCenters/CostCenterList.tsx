import React from 'react';
import {
  Table,
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Flex,
  Box,
  Heading,
  Spacer,
  ButtonGroup,
  Button,
  Spinner,
} from '@chakra-ui/react';
import { CostCentersCollection } from '/imports/api/costCenters/collection';
import { FaPlus } from 'react-icons/fa6';
import { RoleNames } from '/imports/api/users/collection';
import { useSubscribe, useFind } from '/imports/ui/shared/hooks/useSubscribe';
import { list } from '/imports/api/costCenters/publications/list';
import CostCenterForm from './CostCenterForm';
import CostCenterListItem from './CostCenterListItem';

interface CostCenterViewModel {
  _id?: string;
  name: string;
}

export const CostCenterListRoles = [RoleNames.ADMIN];

const CostCenterList = () => {
  const isLoading = useSubscribe(list);
  const costCenters: CostCenterViewModel[] = useFind(() => CostCentersCollection.find({}));

  if (isLoading())
    return (
      <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
    );

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={{ base: 4, md: 8 }}
        width="full"
        h="full"
        minH={{
          base: 'calc(100vh - 2rem)',
          md: '100vh',
        }}
        bgColor="white"
      >
        <Flex minWidth="max-content" alignItems="center" gap="2" mb={6}>
          <Box>
            <Heading as="h3" size="lg">
              Cost Centers
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <CostCenterForm
              ActionButton={({ onOpen }) => (
                <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="teal">
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <TableContainer minH="full" whiteSpace="normal">
          <Table size="sm" variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {costCenters.map((a) => (
                <CostCenterListItem key={a._id} costCenter={a} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};

export default CostCenterList;
