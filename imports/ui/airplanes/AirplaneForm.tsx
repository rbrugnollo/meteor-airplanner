import React from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { Meteor } from "meteor/meteor";

interface AirplaneFormData {
  name: string;
  tailNumber: string;
}

const AirplaneForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AirplaneFormData>();

  const handleFormSubmit = async (data: AirplaneFormData) => {
    Meteor.call('airplanes.insert', data);    
  };

  return (
    <Flex width="full" align="center" justifyContent="center">
      <Box
        p={8}
        maxWidth="500px"
        borderWidth={1}
        borderRadius={8}
        boxShadow="lg"
        bgColor="white"
      >
        <Box my={4} textAlign="left">
          <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
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
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
              width="full"
              mt={4}
            >
              Save
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};

export default AirplaneForm;
