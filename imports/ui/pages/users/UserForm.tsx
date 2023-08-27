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
import { Select } from 'chakra-react-select';
import { useForm, Controller } from 'react-hook-form';
import { Meteor } from 'meteor/meteor';
import { RoleNames } from '/imports/api/users/collection';

interface UserFormData {
  name: string;
  email: string;
  roles: { label: string; value: string }[];
}

interface UserFormActionButtonProps {
  readonly onOpen: () => void;
}

interface UserFormProps {
  readonly userId?: string;
  readonly ActionButton: React.JSXElementConstructor<UserFormActionButtonProps>;
}

const UserForm = ({ userId, ActionButton }: UserFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<UserFormData>({
    defaultValues: async () => {
      if (userId) {
        const user = await Meteor.callAsync('users.getOne', userId);
        return {
          name: user.profile.name,
          email: user.emails[0].address,
          roles: user.profile.roles?.map((m: string) => ({ label: m, value: m })) ?? [],
        };
      }
      return {
        name: '',
        email: '',
        roles: [],
      };
    },
  });

  const toast = useToast();

  const handleFormSubmit = async (data: UserFormData) => {
    if (userId) {
      console.log(data);
      await Meteor.callAsync('users.update', {
        _id: userId,
        ...data,
        roles: data.roles.map((m) => m.value),
      });
      toast({
        description: 'User successfully updated.',
        status: 'success',
      });
    } else {
      await Meteor.callAsync('users.insert', {
        ...data,
        roles: data.roles.map((m) => m.value),
      });
      toast({
        description: 'User successfully created.',
        status: 'success',
      });
    }
    handleClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = userId ? 'Edit User' : 'Add new User';

  return (
    <>
      <ActionButton onOpen={onOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form id="user-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
              <FormControl isRequired isInvalid={!!errors.name}>
                <FormLabel htmlFor="name">Name</FormLabel>
                <Input
                  type="text"
                  {...register('name', {
                    required: 'Please enter Name',
                    minLength: 3,
                  })}
                />
                <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.email} mt={6}>
                <FormLabel htmlFor="email">Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    required: 'Please enter Email',
                  })}
                />
                <FormErrorMessage>{errors.email && errors.email.message}</FormErrorMessage>
              </FormControl>
              <Controller
                control={control}
                name="roles"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="roles">Roles</FormLabel>
                    <Select
                      isMulti
                      name={name}
                      ref={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      options={Object.entries(RoleNames).map(([_, value]) => ({
                        label: value,
                        value,
                      }))}
                      placeholder="Roles"
                      hideSelectedOptions
                      closeMenuOnSelect={false}
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
              form="user-form"
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

export default UserForm;
