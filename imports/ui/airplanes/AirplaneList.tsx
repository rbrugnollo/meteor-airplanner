import React from "react";
import { Table, TableContainer, Thead, Tr, Th, Td, Tbody } from "@chakra-ui/react";
import { AirplanesCollection } from "../../api/AirplanesCollection";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import AirplaneListItem from "./AirplaneListItem";

interface AirplaneViewModel {
    _id: string;
    name: string;
    tailNumber: string;
} 

const AirplaneList = () => {
    const isLoading = useSubscribe('airplanes.list');
    const airplanes: AirplaneViewModel[] = useFind(() => 
        AirplanesCollection.find({})
    );

    return (
        <TableContainer>
            <Table variant='striped' colorScheme='teal'>
                <Thead>
                    <Tr>
                        <Th>Name</Th>
                        <Th>Tail Number</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {airplanes.map(a => 
                        <AirplaneListItem key={a._id} airplane={a} />
                    )}
                </Tbody>
            </Table>
        </TableContainer>
    );
}

export default AirplaneList;
