import React from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { Accounts } from 'meteor/accounts-base';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>();
  const toast = useToast();

  const handleFormSubmit = (data: ForgotPasswordFormData) => {
    Accounts.forgotPassword({ email: data.email }, (error) => {
      if (error) {
        toast({
          status: 'error',
          description: error.message,
        });
      } else {
        toast({
          status: 'success',
          description: `Please follow the instructions sent to ${data.email}.`,
        });
      }
    });
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
        mt={8}
      >
        <Box textAlign="center">
          <Heading>Forgot Password</Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                type="email"
                placeholder="test@test.com"
                {...register('email', {
                  required: 'Please enter Email',
                  minLength: 3,
                  maxLength: 200,
                })}
              />
              <FormErrorMessage>{errors.email && errors.email.message}</FormErrorMessage>
            </FormControl>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting} width="full" mt={4}>
              Send Email
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};

export default ForgotPasswordForm;
