import React, { memo } from "react";
import { Tr, Td, ButtonGroup, useToast } from "@chakra-ui/react";
import AirplaneForm from "./AirplaneForm";
import DeleteBtn from "../shared/deleteBtn/DeleteBtn";
import EditBtn from "../shared/editBtn/EditBtn";

interface AirplaneViewModel {
  readonly _id: string;
  readonly name: string;
  readonly tailNumber: string;
}

interface AirplaneListItemProps {
  readonly airplane: AirplaneViewModel;
}

const AirplaneListItem = ({ airplane }: AirplaneListItemProps) => {
  const toast = useToast();

  return (
    <Tr>
      <Td>{airplane.name}</Td>
      <Td>{airplane.tailNumber}</Td>
      <Td isNumeric>
        <ButtonGroup gap="2">
          <AirplaneForm
            ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
          />
          <DeleteBtn
            title={`Delete Airplane ${airplane.name}`}
            onConfirm={() => {
              toast({
                description: `Airplane ${airplane.name} successfully deleted.`,
                status: "success",
              });
            }}
          />
        </ButtonGroup>
      </Td>
    </Tr>
  );
};

export default memo(AirplaneListItem);
