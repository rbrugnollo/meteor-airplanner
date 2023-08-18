import React, { memo } from "react";
import { Tr, Td, ButtonGroup, useToast } from "@chakra-ui/react";
import AirplaneForm from "./AirplaneForm";
import DeleteBtn from "../shared/deleteBtn/DeleteBtn";
import EditBtn from "../shared/editBtn/EditBtn";
import { Meteor } from "meteor/meteor";

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

  const handleRemove = () => {
    Meteor.call("airplanes.remove", airplane._id, (error: any) => {
      if (!error) {
        toast({
          description: `Airplane ${airplane.name} successfully deleted.`,
          status: "success",
        });
      }
    });
  };

  return (
    <Tr>
      <Td>{airplane.name}</Td>
      <Td>{airplane.tailNumber}</Td>
      <Td isNumeric>
        <ButtonGroup gap={{ base: 0, md: 1 }}>
          <AirplaneForm
            airplaneId={airplane._id}
            ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
          />
          <DeleteBtn
            title={`Delete Airplane ${airplane.name}?`}
            onConfirm={handleRemove}
          />
        </ButtonGroup>
      </Td>
    </Tr>
  );
};

export default memo(AirplaneListItem);
