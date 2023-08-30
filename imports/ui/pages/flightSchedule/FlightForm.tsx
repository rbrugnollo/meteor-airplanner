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
  Textarea,
  InputGroup,
  InputRightAddon,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { Meteor } from 'meteor/meteor';
import { Select } from 'chakra-react-select';
import { RoleNames } from '/imports/api/users/collection';
import { insert } from '/imports/api/airplanes/methods/insert';
import { update } from '/imports/api/airplanes/methods/update';
import { getOne } from '/imports/api/airplanes/methods/getOne';
import { useSubscribe, useFind } from '/imports/ui/shared/hooks/useSubscribe';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import AirportSelect from '../../shared/selects/AirportSelect';
import AirplaneSelect from '../../shared/selects/AirplaneSelect';
import UserSelect from '../../shared/selects/UserSelect';
import CostCenterSelect from '../../shared/selects/CostCenterSelect';

interface FlightFormData {
  airplane: ValueLabelType;
  scheduledDateTime: Date;
  estimatedDuration: number;
  origin: ValueLabelType;
  destination: ValueLabelType;
  captain: ValueLabelType;
  firstOfficer: ValueLabelType;
  passengers: ValueLabelType[];
  requester: ValueLabelType;
  costCenter: ValueLabelType;
  notes: string;
}

interface FlightFormActionButtonProps {
  readonly onOpen: () => void;
}

interface FlightFormProps {
  readonly airplaneId?: string;
  readonly ActionButton: React.JSXElementConstructor<FlightFormActionButtonProps>;
}

const FlightForm = ({ airplaneId, ActionButton }: FlightFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<FlightFormData>();

  const toast = useToast();

  const handleInsert = async (data: FlightFormData) => {
    // try {
    //   await insert(data);
    //   toast({
    //     description: 'Airplane successfully created.',
    //     status: 'success',
    //   });
    //   handleClose();
    // } catch (e: unknown) {
    //   console.log(e);
    //   if (e instanceof Meteor.Error) {
    //     toast({
    //       description: e.message,
    //       status: 'error',
    //     });
    //   }
    // }
  };

  const handleUpdate = async (data: FlightFormData) => {
    // try {
    //   await update({
    //     _id: airplaneId!,
    //     ...data,
    //   });
    //   toast({
    //     description: 'Airplane successfully updated.',
    //     status: 'success',
    //   });
    //   handleClose();
    // } catch (e: unknown) {
    //   if (e instanceof Meteor.Error) {
    //     toast({
    //       description: e.message,
    //       status: 'error',
    //     });
    //   }
    // }
  };

  const handleFormSubmit = async (data: FlightFormData) => {
    if (airplaneId) {
      await handleUpdate(data);
    } else {
      await handleInsert(data);
    }
  };

  const handleOpen = async () => {
    // setValue('name', '');
    // setValue('tailNumber', '');
    // setValue('manager', undefined);
    // setValue('captain', undefined);
    // setValue('firstOfficer', undefined);

    onOpen();

    // console.log(airplaneId);

    // if (airplaneId) {
    //   const airplane = await getOne({ _id: airplaneId });
    //   console.log(airplane);
    //   setValue('name', airplane?.name || '');
    //   setValue('tailNumber', airplane?.tailNumber || '');
    //   setValue('captain', airplane?.captain);
    //   setValue('firstOfficer', airplane?.firstOfficer);
    //   setValue('manager', airplane?.manager);
    //   setValue('pilots', airplane?.pilots);
    // }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = airplaneId ? 'Edit Airplane' : 'Schedule a new Flight';

  return (
    <>
      <ActionButton onOpen={handleOpen} />
      <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{headerText}</DrawerHeader>
          <DrawerBody>
            <form id="flight-form" noValidate onSubmit={handleSubmit(handleFormSubmit)}>
              <Controller
                control={control}
                name="airplane"
                rules={{ required: 'Please enter Airplane' }}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6} isRequired isInvalid={!!errors.airplane}>
                    <FormLabel htmlFor="airplane">Airplane</FormLabel>
                    <AirplaneSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <FormErrorMessage>
                      {errors.airplane && errors.airplane.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
              <FormControl mt={6} isRequired isInvalid={!!errors.scheduledDateTime}>
                <FormLabel htmlFor="scheduledDateTime">Date Time</FormLabel>
                <Input
                  placeholder="Select Date and Time"
                  type="datetime-local"
                  {...register('scheduledDateTime', {
                    required: 'Please enter Date and Time',
                  })}
                />
                <FormErrorMessage>
                  {errors.scheduledDateTime && errors.scheduledDateTime.message}
                </FormErrorMessage>
              </FormControl>
              <Controller
                control={control}
                name="origin"
                rules={{ required: 'Please enter Origin' }}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6} isRequired isInvalid={!!errors.destination}>
                    <FormLabel htmlFor="origin">Origin</FormLabel>
                    <AirportSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <FormErrorMessage>{errors.origin && errors.origin.message}</FormErrorMessage>
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                rules={{ required: 'Please enter Destination' }}
                name="destination"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6} isRequired isInvalid={!!errors.destination}>
                    <FormLabel htmlFor="destination">Destination</FormLabel>
                    <AirportSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                    <FormErrorMessage>
                      {errors.destination && errors.destination.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
              <FormControl mt={6} isRequired isInvalid={!!errors.estimatedDuration}>
                <FormLabel htmlFor="estimatedFlightTime">Duration</FormLabel>
                <Input
                  placeholder="HH:mm"
                  {...register('estimatedDuration', {
                    required: 'Please enter Duration',
                  })}
                />
                <FormErrorMessage>
                  {errors.estimatedDuration && errors.estimatedDuration.message}
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
                name="passengers"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="passengers">Passengers</FormLabel>
                    <UserSelect
                      isMulti
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER, RoleNames.PASSENGER]}
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="requester"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="requester">Requester</FormLabel>
                    <UserSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={[RoleNames.CAPTAIN, RoleNames.FIRST_OFFICER, RoleNames.PASSENGER]}
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="costCenter"
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6}>
                    <FormLabel htmlFor="costCenter">Cost Center</FormLabel>
                    <CostCenterSelect
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                    />
                  </FormControl>
                )}
              />
              <FormControl mt={6}>
                <FormLabel htmlFor="percentage">%</FormLabel>
                <InputGroup>
                  <Input />
                  <InputRightAddon>%</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl mt={6}>
                <FormLabel htmlFor="notes">Notes</FormLabel>
                <Textarea {...register('notes')} />
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
              form="flight-form"
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

export default FlightForm;
