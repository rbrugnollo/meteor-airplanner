import React from "react";
import {
  Drawer,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  DrawerOverlay,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Meteor } from "meteor/meteor";
import { AirplaneType } from "/imports/api/AirplanesCollection";

interface AirplaneFormData {
  name: string;
  tailNumber: string;
}

interface AirplaneFormActionButtonProps {
  readonly onOpen: () => void;
}

interface AirplaneFormProps {
  readonly airplaneId?: string;
  readonly ActionButton: React.JSXElementConstructor<AirplaneFormActionButtonProps>;
}

const AirplaneForm = ({ airplaneId, ActionButton }: AirplaneFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<AirplaneFormData>({
    defaultValues: async () => {
      if (airplaneId) {
        return await Meteor.callAsync("airplanes.getOne", airplaneId);
      }
      return {};
    },
  });

  const toast = useToast();

  const handleFormSubmit = async (data: AirplaneFormData) => {
    if (airplaneId) {
      await Meteor.callAsync("airplanes.update", {
        _id: airplaneId,
        ...data,
      });
      toast({
        description: `Airplane successfully updated.`,
        status: "success",
      });
    } else {
      await Meteor.call("airplanes.insert", data);
      toast({
        description: `Airplane successfully saved.`,
        status: "success",
      });
    }
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = airplaneId ? "Edit Airplane" : "Add new Airplane";

  return (
    <>
      <ActionButton onOpen={onOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form
              id="airplane-form"
              noValidate
              onSubmit={handleSubmit(handleFormSubmit)}
            >
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                  type="text"
                  {...register("name", {
                    required: "Please enter Name",
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.tailNumber} mt={6}>
                <FormLabel htmlFor="tailNumber">Tail Number</FormLabel>
                <Input
                  type="text"
                  {...register("tailNumber", {
                    required: "Please enter Tail Number",
                  })}
                />
                <FormErrorMessage>
                  {errors.tailNumber && errors.tailNumber.message}
                </FormErrorMessage>
              </FormControl>
            </form>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading || isSubmitting}
              type="submit"
              form="airplane-form"
              colorScheme="blue"
            >
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AirplaneForm;
