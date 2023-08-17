import React, { memo } from "react";
import { Tr, Td } from "@chakra-ui/react";

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
    </Tr>
);

export default memo(AirplaneListItem);
