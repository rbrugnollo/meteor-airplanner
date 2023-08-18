import React from "react";
import {
  useDisclosure,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FaTrashCan } from "react-icons/fa6";

interface DeleteBtnProps {
  readonly title?: string;
  readonly message?: string;
  readonly onConfirm: () => void;
}

const DeleteBtn = ({ title, message, onConfirm }: DeleteBtnProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const finalTitle = title ?? "Delete";
  const finalMessage =
    message ?? "Are you sure? You can't undo this action afterwards.";
  return (
    <>
      <Tooltip label="Delete">
        <IconButton
          size={{ base: "sm", md: "md" }}
          aria-label="Delete"
          icon={<FaTrashCan />}
          colorScheme="red"
          onClick={onOpen}
        />
      </Tooltip>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {finalTitle}
            </AlertDialogHeader>

            <AlertDialogBody>{finalMessage}</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteBtn;
