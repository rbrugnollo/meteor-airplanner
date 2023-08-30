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
import { insert } from '/imports/api/airports/methods/insert';
import { update } from '/imports/api/airports/methods/update';
import { getOne } from '/imports/api/airports/methods/getOne';

interface AirportFormData {
  readonly name: string;
  readonly city: string;
  readonly country: string;
  readonly iata: string;
  readonly icao: string;
  readonly lat: string;
  readonly lon: string;
  readonly timezone: string;
}

interface AirportFormActionButtonProps {
  readonly onOpen: () => void;
}

interface AirportFormProps {
  readonly airportId?: string;
  readonly ActionButton: React.JSXElementConstructor<AirportFormActionButtonProps>;
}

const AirportForm = ({ airportId, ActionButton }: AirportFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<AirportFormData>();

  const toast = useToast();

  const handleInsert = async (data: AirportFormData) => {
    try {
      await insert(data);
      toast({
        description: 'Airport successfully created.',
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

  const handleUpdate = async (data: AirportFormData) => {
    try {
      await update({
        _id: airportId!,
        ...data,
      });
      toast({
        description: 'Airport successfully updated.',
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

  const handleFormSubmit = async (data: AirportFormData) => {
    if (airportId) {
      await handleUpdate(data);
    } else {
      await handleInsert(data);
    }
  };

  const handleOpen = async () => {
    setValue('name', '');
    setValue('city', '');
    setValue('country', '');
    setValue('iata', '');
    setValue('icao', '');
    setValue('lat', '');
    setValue('lon', '');
    setValue('timezone', '');

    onOpen();

    if (airportId) {
      const airport = await getOne({ _id: airportId });
      setValue('name', airport?.name || '');
      setValue('city', airport?.city || '');
      setValue('country', airport?.country || '');
      setValue('iata', airport?.iata || '');
      setValue('icao', airport?.icao || '');
      setValue('lat', airport?.lat || '');
      setValue('lon', airport?.lon || '');
      setValue('timezone', airport?.timezone || '');
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = airportId ? 'Edit Airport' : 'Add new Airport';

  return (
    <>
      <ActionButton onOpen={handleOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form id="airport-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
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
              <FormControl mt={6} isRequired isInvalid={!!errors.city}>
                <FormLabel htmlFor="city">City</FormLabel>
                <Input
                  type="text"
                  {...register('city', {
                    required: 'Please enter City',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.city && errors.city.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.country}>
                <FormLabel htmlFor="country">Country</FormLabel>
                <Input
                  type="text"
                  {...register('country', {
                    required: 'Please enter Country',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.country && errors.country.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.iata}>
                <FormLabel htmlFor="iata">IATA</FormLabel>
                <Input
                  type="text"
                  {...register('iata', {
                    required: 'Please enter IATA',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.iata && errors.iata.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.icao}>
                <FormLabel htmlFor="icao">ICAO</FormLabel>
                <Input
                  type="text"
                  {...register('icao', {
                    required: 'Please enter ICAO',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.icao && errors.icao.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.lat}>
                <FormLabel htmlFor="lat">Latitude</FormLabel>
                <Input
                  type="text"
                  {...register('lat', {
                    required: 'Please enter Latitude',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.lat && errors.lat.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.lon}>
                <FormLabel htmlFor="lon">Longitude</FormLabel>
                <Input
                  type="text"
                  {...register('lon', {
                    required: 'Please enter Longitude',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.lon && errors.lon.message}</FormErrorMessage>
              </FormControl>
              <FormControl mt={6} isRequired isInvalid={!!errors.timezone}>
                <FormLabel htmlFor="timezone">Timezone</FormLabel>
                <Input
                  type="text"
                  {...register('timezone', {
                    required: 'Please enter Timezone',
                    minLength: 3,
                    maxLength: 300,
                  })}
                />
                <FormErrorMessage>{errors.timezone && errors.timezone.message}</FormErrorMessage>
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
              form="airport-form"
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

export default AirportForm;
