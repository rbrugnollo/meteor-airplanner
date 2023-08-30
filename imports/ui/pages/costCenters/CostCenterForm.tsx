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
import { useForm } from 'react-hook-form';
import { Meteor } from 'meteor/meteor';
import { insert } from '/imports/api/costCenters/methods/insert';
import { update } from '/imports/api/costCenters/methods/update';
import { getOne } from '/imports/api/costCenters/methods/getOne';

interface CostCenterFormData {
  name: string;
}

interface CostCenterFormActionButtonProps {
  readonly onOpen: () => void;
}

interface CostCenterFormProps {
  readonly costCenterId?: string;
  readonly ActionButton: React.JSXElementConstructor<CostCenterFormActionButtonProps>;
}

const CostCenterForm = ({ costCenterId, ActionButton }: CostCenterFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<CostCenterFormData>();

  const toast = useToast();

  const handleInsert = async (data: CostCenterFormData) => {
    try {
      await insert(data);
      toast({
        description: 'Cost Center successfully created.',
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

  const handleUpdate = async (data: CostCenterFormData) => {
    try {
      await update({
        _id: costCenterId!,
        ...data,
      });
      toast({
        description: 'Cost Center successfully updated.',
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

  const handleFormSubmit = async (data: CostCenterFormData) => {
    if (costCenterId) {
      await handleUpdate(data);
    } else {
      await handleInsert(data);
    }
  };

  const handleOpen = async () => {
    setValue('name', '');

    onOpen();

    if (costCenterId) {
      const costCenter = await getOne({ _id: costCenterId });
      setValue('name', costCenter?.name || '');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = costCenterId ? 'Edit Cost Center' : 'Add new Cost Center';

  return (
    <>
      <ActionButton onOpen={handleOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form id="costCenter-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
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
            </form>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              isLoading={isLoading || isSubmitting}
              type="submit"
              form="costCenter-form"
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

export default CostCenterForm;
