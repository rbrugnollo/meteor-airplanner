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
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Meteor } from "meteor/meteor";

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

const AirplaneForm = ({ ActionButton }: AirplaneFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AirplaneFormData>();

  const handleFormSubmit = async (data: AirplaneFormData) => {
    Meteor.call("airplanes.insert", data);
  };

  return (
    <>
      <ActionButton onOpen={onOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Add New Airplane</DrawerHeader>
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
            <Button variant="outline" mr={3} onClick={onClose}>
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
