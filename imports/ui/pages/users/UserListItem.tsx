import React, { memo } from "react";
import { Tr, Td, ButtonGroup } from "@chakra-ui/react";
import UserForm from "./UserForm";
import EditBtn from "../../shared/editBtn/EditBtn";

interface UserViewModel {
  _id: string;
  username: string;
  profile: {
    name: string;
    roles: string[];
  };
}

interface UserListItemProps {
  readonly user: UserViewModel;
}

const UserListItem = ({ user }: UserListItemProps) => (
  <Tr>
    <Td>{user.profile?.name ?? user.username}</Td>
    <Td>{user.profile?.roles?.join(", ")}</Td>
    <Td isNumeric>
      <ButtonGroup gap={{ base: 0, md: 1 }}>
        <UserForm
          userId={user._id}
          ActionButton={({ onOpen }) => <EditBtn onClick={onOpen} />}
        />
      </ButtonGroup>
    </Td>
  </Tr>
);

export default memo(UserListItem);
