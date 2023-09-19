import React, { useEffect, useState } from 'react';
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
  Text,
  Box,
} from '@chakra-ui/react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Meteor } from 'meteor/meteor';
import { insert as insertFlight } from '/imports/api/flights/methods/insert';
import { update } from '/imports/api/flights/methods/update';
import { getOne } from '/imports/api/flights/methods/getOne';
import { ValueLabelType } from '/imports/api/common/ValueLabelType';
import AirportSelect from '../../shared/selects/AirportSelect';
import AirplaneSelect from '../../shared/selects/AirplaneSelect';
import UserSelect from '../../shared/selects/UserSelect';
import CostCenterSelect from '../../shared/selects/CostCenterSelect';
import DatePicker from '../../shared/datePicker/DatePicker';
import PilotSelect from '../../shared/selects/PilotSelect';
import { Airplane } from '/imports/api/airplanes/collection';
import { getOne as getOneAirplane } from '/imports/api/airplanes/methods/getOne';

export interface FlightFormData {
  readonly airplane: ValueLabelType;
  readonly scheduledDateTime: Date;
  readonly estimatedDuration: string;
  readonly origin: ValueLabelType;
  readonly destination: ValueLabelType;
  readonly captain?: ValueLabelType;
  readonly firstOfficer?: ValueLabelType;
  readonly passengers?: ValueLabelType[];
  readonly requesters?: {
    readonly requester?: ValueLabelType;
    readonly costCenter?: ValueLabelType;
    readonly percentage?: number;
  }[];
  readonly notes?: string;
}

interface FlightFormActionButtonProps {
  readonly onOpen: () => void;
}

interface FlightFormProps {
  readonly flightId?: string;
  readonly ActionButton: React.JSXElementConstructor<FlightFormActionButtonProps>;
}

const FlightForm = ({ flightId, ActionButton }: FlightFormProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting, isLoading },
  } = useForm<FlightFormData>({
    defaultValues: {
      airplane: undefined,
      scheduledDateTime: undefined,
      estimatedDuration: undefined,
      origin: undefined,
      destination: undefined,
      captain: undefined,
      firstOfficer: undefined,
      passengers: undefined,
      requesters: [],
      notes: undefined,
    },
  });
  const { fields, append } = useFieldArray({
    control,
    name: 'requesters',
  });

  const toast = useToast();

  const [airplane, setAirplane] = useState<Airplane | undefined>(undefined);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'airplane' && type === 'change') {
        handleFetchAirplane(value?.airplane?.value);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleFetchAirplane = async (airplaneId?: string) => {
    setAirplane(undefined);
    if (airplaneId) {
      const airplane = await getOneAirplane({ _id: airplaneId });
      if (airplane) {
        setAirplane(airplane);
      }
    }
  };

  const handleInsert = async (data: FlightFormData) => {
    try {
      await insertFlight(data);
      toast({
        description: 'Flight successfully created.',
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

  const handleUpdate = async (data: FlightFormData) => {
    try {
      await update({
        _id: flightId!,
        ...data,
      });
      toast({
        description: 'Flight successfully updated.',
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

  const handleFormSubmit = async (data: FlightFormData) => {
    if (flightId) {
      await handleUpdate(data);
    } else {
      await handleInsert(data);
    }
  };

  const handleOpen = async () => {
    setValue('requesters', undefined);
    onOpen();
    if (flightId) {
      const flight = await getOne({ _id: flightId });
      if (flight) {
        setValue('airplane', flight.airplane);
        setValue('scheduledDateTime', flight.scheduledDateTime);
        setValue('estimatedDuration', flight.estimatedDuration);
        setValue('origin', flight.origin);
        setValue('destination', flight.destination);
        setValue('captain', flight.captain);
        setValue('firstOfficer', flight.firstOfficer);
        setValue('passengers', flight.passengers);
        setValue('requesters', flight.requesters);
        setValue('notes', flight.notes);
      }
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const headerText = flightId ? 'Edit Airplane' : 'Schedule a new Flight';

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
                      onChange={(e) => {
                        setValue('captain', undefined);
                        setValue('firstOfficer', undefined);
                        onChange(e);
                      }}
                      onBlur={onBlur}
                      value={value}
                    />
                    <FormErrorMessage>
                      {errors.airplane && errors.airplane.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="scheduledDateTime"
                rules={{ required: 'Please enter Date and Time' }}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6} isRequired isInvalid={!!errors.scheduledDateTime}>
                    <FormLabel htmlFor="scheduledDateTime">Date Time</FormLabel>
                    <DatePicker
                      name={name}
                      datepickerRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      selected={value}
                      showTimeSelect
                      dateFormat="Pp"
                      timeFormat="p"
                      placeholderText="Click to select"
                    />
                    <FormErrorMessage>
                      {errors.scheduledDateTime && errors.scheduledDateTime.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
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
                  type="text"
                  {...register('estimatedDuration', {
                    required: 'Please enter Duration',
                    pattern: {
                      value: /^((\d+:)?\d+:)?\d*$/,
                      message: 'Entered value does not match time format',
                    },
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
                    <PilotSelect
                      isDisabled={!watch('airplane')}
                      airplaneId={watch('airplane')?.value}
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      onOptionsLoaded={({ captain }) => {
                        if (captain && !getValues('captain')) setValue('captain', captain);
                      }}
                      roles={['Captain']}
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
                    <PilotSelect
                      isDisabled={!watch('airplane')}
                      airplaneId={watch('airplane')?.value}
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      onOptionsLoaded={({ firstOfficer }) => {
                        if (firstOfficer && !getValues('firstOfficer'))
                          setValue('firstOfficer', firstOfficer);
                      }}
                      roles={['First Officer']}
                    />
                  </FormControl>
                )}
              />
              <Controller
                control={control}
                name="passengers"
                rules={{
                  validate: (value) => {
                    const seats = airplane?.seats;
                    const length = value?.length ?? 0;
                    if (seats && length > seats) {
                      return `This airplane can only take ${seats} passengers`;
                    }
                    return true;
                  },
                }}
                render={({ field: { onChange, onBlur, value, name, ref } }) => (
                  <FormControl mt={6} isInvalid={!!errors.passengers}>
                    <FormLabel htmlFor="passengers">Passengers</FormLabel>
                    <UserSelect
                      isMulti
                      isDisabled={!watch('airplane')}
                      name={name}
                      selectRef={ref}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={value}
                      roles={['Captain', 'First Officer', 'Passenger']}
                    />
                    <FormErrorMessage>
                      {errors.passengers && errors.passengers.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              />
              <Box mt={6}>
                <Text>Requesters</Text>
                {fields.map((field, index) => (
                  <div key={field.id}>
                    <Controller
                      control={control}
                      name={`requesters.${index}.requester`}
                      rules={{ required: 'Please enter Requester' }}
                      render={({ field: { onChange, onBlur, value, name, ref } }) => (
                        <FormControl
                          mt={6}
                          isRequired
                          isInvalid={!!(errors.requesters && errors.requesters[0]?.requester)}
                        >
                          <FormLabel htmlFor={`requesters.${index}.requester`}>Requester</FormLabel>
                          <UserSelect
                            name={name}
                            selectRef={ref}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            roles={['Captain', 'First Officer', 'Passenger']}
                          />
                          <FormErrorMessage>
                            {errors.requesters &&
                              errors.requesters[0]?.requester &&
                              errors.requesters[0]?.requester.message}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    />
                    <Controller
                      control={control}
                      name={`requesters.${index}.costCenter`}
                      rules={{ required: 'Please enter Cost Center' }}
                      render={({ field: { onChange, onBlur, value, name, ref } }) => (
                        <FormControl
                          mt={6}
                          isRequired
                          isInvalid={!!(errors.requesters && errors.requesters[0]?.costCenter)}
                        >
                          <FormLabel htmlFor={`requesters.${index}.costCenter`}>
                            Cost Center
                          </FormLabel>
                          <CostCenterSelect
                            name={name}
                            selectRef={ref}
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                          />
                          <FormErrorMessage>
                            {errors.requesters &&
                              errors.requesters[0]?.costCenter &&
                              errors.requesters[0]?.costCenter.message}
                          </FormErrorMessage>
                        </FormControl>
                      )}
                    />
                    <FormControl
                      mt={6}
                      isRequired
                      isInvalid={!!(errors.requesters && errors.requesters[0]?.percentage)}
                    >
                      <FormLabel htmlFor={`requesters.${index}.percentage`}>Percentage</FormLabel>
                      <InputGroup>
                        <Input
                          {...register(`requesters.${index}.percentage`, {
                            required: 'Please enter Percentage',
                            valueAsNumber: true,
                          })}
                        />
                        <InputRightAddon>%</InputRightAddon>
                      </InputGroup>
                      <FormErrorMessage>
                        {errors.requesters &&
                          errors.requesters[0]?.percentage &&
                          errors.requesters[0]?.percentage.message}
                      </FormErrorMessage>
                    </FormControl>
                  </div>
                ))}
              </Box>
              <Button
                onClick={() => {
                  append({});
                  const requesters = getValues('requesters');
                  requesters?.forEach((_item, index) => {
                    setValue(
                      `requesters.${index}.percentage`,
                      parseFloat((100 / requesters.length).toFixed(2)),
                    );
                  });
                }}
              >
                Add
              </Button>
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
