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
import { useForm, Controller } from "react-hook-form";
import { Meteor } from "meteor/meteor";
import { useFind, useSubscribe } from "meteor/react-meteor-data";
import { Select } from "chakra-react-select";
import { RoleNames } from "/imports/api/users/collection";

interface AirplaneFormData {
  name: string;
  tailNumber: string;
  active: string;
  captain: string;
  firstOfficer: string;
  manager: string;
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
  const roles = [RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER];
  const isSubLoading = useSubscribe("users.select", { roles });
  const users: any[] = useFind(() =>
    Meteor.users.find({ "profile.roles": { $in: roles } }, {})
  );
  const {
    register,
    handleSubmit,
    reset,
    control,
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

  if (!isSubLoading()) {
    console.log(users);
  }

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
              <Controller
                control={control}
                name="captain"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="captain">Captain</FormLabel>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={
                        users
                          ?.filter((f) =>
                            f.profile.roles?.includes(RoleNames.CAPTAIN)
                          )
                          .map((m) => ({
                            label: m.profile.name,
                            value: m.username,
                          })) ?? []
                      }
                      placeholder="Captain"
                      closeMenuOnSelect
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="firstOfficer"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="firstOfficer">First Officer</FormLabel>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={
                        users
                          ?.filter((f) =>
                            f.profile.roles?.includes(RoleNames.FIRST_OFFICER)
                          )
                          .map((m) => ({ label: m.profile.name, value: m })) ??
                        []
                      }
                      placeholder="First Officer"
                      closeMenuOnSelect
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="manager"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="manager">Manager</FormLabel>
                    <Select
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={
                        users?.map((m) => ({
                          label: m.profile.name,
                          value: m,
                        })) ?? []
                      }
                      placeholder="Manager"
                      closeMenuOnSelect
                    />
                  </FormControl>
                )}
              />
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
