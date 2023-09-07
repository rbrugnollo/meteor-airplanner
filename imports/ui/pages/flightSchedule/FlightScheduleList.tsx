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
  SkeletonText,
} from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa6';
import { RoleNames } from '/imports/api/users/collection';
import FlightForm from './FlightForm';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import { useSubscribe, useFind } from '../../shared/hooks/useSubscribe';
import { FlightsCollection } from '/imports/api/flights/collection';
import { list } from '/imports/api/flights/publications/list';
import FlightScheduleListItem from './FlightScheduleListItem';

export const FlightScheduleListRoles = [RoleNames.ADMIN];

interface FlightViewModel {
  readonly _id: string;
  readonly airplane: ValueLabelType;
  readonly scheduledDateTime: Date;
}

const FlightScheduleList = () => {
  const isLoading = useSubscribe(list);
  const flights: FlightViewModel[] = useFind(() => FlightsCollection.find({}));

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
              Flight Schedule
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <FlightForm
              ActionButton={({ onOpen }) => (
                <Button leftIcon={<FaPlus />} onClick={onOpen} colorScheme="teal">
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <SkeletonText noOfLines={6} spacing={4} skeletonHeight={10} isLoaded={!isLoading()}>
          <TableContainer minH="full" whiteSpace="normal">
            <Table size="sm" variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th>Airplane</Th>
                  <Th>DateTime</Th>
                  <Th>&nbsp;</Th>
                </Tr>
              </Thead>
              <Tbody>
                {flights.map((a) => (
                  <FlightScheduleListItem key={a._id} flight={a} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </SkeletonText>
      </Box>
    </Flex>
  );
};

export default FlightScheduleList;
