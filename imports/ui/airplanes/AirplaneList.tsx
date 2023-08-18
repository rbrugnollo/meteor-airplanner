import React from "react";
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
} from "@chakra-ui/react";
import { AirplanesCollection } from "../../api/AirplanesCollection";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import AirplaneListItem from "./AirplaneListItem";
import AirplaneForm from "./AirplaneForm";
import { FaPlus } from "react-icons/fa6";

interface AirplaneViewModel {
  _id: string;
  name: string;
  tailNumber: string;
}

const AirplaneList = () => {
  const isLoading = useSubscribe("airplanes.list");
  const airplanes: AirplaneViewModel[] = useFind(() =>
    AirplanesCollection.find({})
  );

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={8}
        width="full"
        height="full"
        borderWidth={1}
        borderRadius={8}
        bgColor="white"
      >
        <Flex minWidth="max-content" alignItems="center" gap="2" mb={3}>
          <Box>
            <Heading as="h3" size="lg">
              Airplanes
            </Heading>
          </Box>
          <Spacer />
          <ButtonGroup gap="2">
            <AirplaneForm
              ActionButton={({ onOpen }) => (
                <Button
                  leftIcon={<FaPlus />}
                  onClick={onOpen}
                  colorScheme="teal"
                >
                  Add New
                </Button>
              )}
            />
          </ButtonGroup>
        </Flex>
        <TableContainer>
          <Table variant="striped" colorScheme="teal">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Tail Number</Th>
                <Th>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>
              {airplanes.map((a) => (
                <AirplaneListItem key={a._id} airplane={a} />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Flex>
  );
};

export default AirplaneList;
