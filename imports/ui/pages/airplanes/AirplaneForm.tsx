import React from 'react';
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
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { Meteor } from 'meteor/meteor';
import { RoleNames } from '/imports/api/users/collection';
import { insert } from '/imports/api/airplanes/methods/insert';
import { update } from '/imports/api/airplanes/methods/update';
import { getOne } from '/imports/api/airplanes/methods/getOne';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import UserSelect from '../../shared/selects/UserSelect';

interface AirplaneFormData {
  name: string;
  tailNumber: string;
  captain?: ValueLabelType;
  firstOfficer?: ValueLabelType;
  manager?: ValueLabelType;
  pilots?: ValueLabelType[];
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
    control,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<AirplaneFormData>();

  const toast = useToast();

  const handleInsert = async (data: AirplaneFormData) => {
    try {
      await insert(data);
      toast({
        description: 'Airplane successfully created.',
        status: 'success',
      });
      handleClose();
    } catch (e: unknown) {
      if (e instanceof Meteor.Error) {
        toast({
          description: e.message,
          status: 'error',
        });
      }
    }
  };

  const handleUpdate = async (data: AirplaneFormData) => {
    try {
      await update({
        _id: airplaneId!,
        ...data,
      });
      toast({
        description: 'Airplane successfully updated.',
        status: 'success',
      });
      handleClose();
    } catch (e: unknown) {
      if (e instanceof Meteor.Error) {
        toast({
          description: e.message,
          status: 'error',
        });
      }
    }
  };

  const handleFormSubmit = async (data: AirplaneFormData) => {
    if (airplaneId) {
      await handleUpdate(data);
    } else {
      await handleInsert(data);
    }
  };

  const handleOpen = async () => {
    setValue('name', '');
    setValue('tailNumber', '');
    setValue('manager', undefined);
    setValue('captain', undefined);
    setValue('firstOfficer', undefined);

    onOpen();

    if (airplaneId) {
      const airplane = await getOne({ _id: airplaneId });
      setValue('name', airplane?.name || '');
      setValue('tailNumber', airplane?.tailNumber || '');
      setValue('captain', airplane?.captain);
      setValue('firstOfficer', airplane?.firstOfficer);
      setValue('manager', airplane?.manager);
      setValue('pilots', airplane?.pilots);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = airplaneId ? 'Edit Airplane' : 'Add new Airplane';

  return (
    <>
      <ActionButton onOpen={handleOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form id="airplane-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                  type="text"
                  {...register('name', {
                    required: 'Please enter Name',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.tailNumber} mt={6}>
                <FormLabel htmlFor="tailNumber">Tail Number</FormLabel>
                <Input
                  type="text"
                  {...register('tailNumber', {
                    required: 'Please enter Tail Number',
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
                    <UserSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.CAPTAIN]}
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
                    <UserSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.FIRST_OFFICER]}
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
                    <UserSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.CAPTAIN]}
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="pilots"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="pilots">Pilots</FormLabel>
                    <UserSelect
                      isMulti
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER]}
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
