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
    setValue,
    formState: { errors },
  } = useForm<AirplaneFormData>();

  const toast = useToast();

  const handleFormSubmit = async (data: AirplaneFormData) => {
    if (airplaneId) {
      Meteor.call(
        "airplanes.update",
        { _id: airplaneId, ...data },
        (error: any) => {
          if (!error) {
            toast({
              description: `Airplane successfully updated.`,
              status: "success",
            });
            handleClose();
          }
        }
      );
    } else {
      Meteor.call("airplanes.insert", data, (error: any) => {
        if (!error) {
          toast({
            description: `Airplane successfully saved.`,
            status: "success",
          });
          handleClose();
        }
      });
    }
  };

  const handleOpen = () => {
    onOpen();
    if (airplaneId) {
      Meteor.call(
        "airplanes.getOne",
        airplaneId,
        (error: any, result: AirplaneType) => {
          if (!error) {
            setValue("name", result.name);
            setValue("tailNumber", result.tailNumber);
          }
        }
      );
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = airplaneId ? "Edit Airplane" : "Add new Airplane";

  return (
    <>
      <ActionButton onOpen={handleOpen} />
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
            <Button type="submit" form="airplane-form" colorScheme="blue">
              Save
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AirplaneForm;
