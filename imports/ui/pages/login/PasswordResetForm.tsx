import React from "react";
import { useMatch, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Accounts } from "meteor/accounts-base";

interface PasswordResetFormData {
  password: string;
  confirm: string;
}

const PasswordResetForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetFormData>();
  const match = useMatch("password/:action/:token");
  const toast = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const handlePasswordVisibility = () => setShowPassword(!showPassword);

  const handleFormSubmit = (data: PasswordResetFormData) => {
    setShowPassword(false);
    const token = match?.params.token ?? "";
    Accounts.resetPassword(token, data.password, function (err) {
      if (err) {
        toast({
          status: "error",
          description: err.message,
        });
      }
      toast({
        status: "success",
        description: "Password successfully defined",
      });
      navigate("/app");
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
          <Heading>
            {match?.params.action == "enroll-account" ? "Set" : "Reset"}{" "}
            Password
          </Heading>
        </Box>
        <Box my={4} textAlign="left">
          <form noValidate onSubmit={handleSubmit(handleFormSubmit)}>
            <FormControl isRequired isInvalid={!!errors.password}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="*******"
                  {...register("password", {
                    required: "Please enter Password",
                    minLength: {
                      value: 8,
                      message: "Password must have at least 8 chars",
                    },
                    maxLength: {
                      value: 50,
                      message: "Password cannot have more than 50 chars",
                    },
                  })}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={handlePasswordVisibility}
                  >
                    {showPassword ? (
                      <Icon as={AiOutlineEye} />
                    ) : (
                      <Icon as={AiOutlineEyeInvisible} />
                    )}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.password && errors.password.message}
              </FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={!!errors.confirm} mt={6}>
              <FormLabel htmlFor="confirm">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="*******"
                  {...register("confirm", {
                    required: "Please enter Password Confirmation",
                    validate: (val: string) => {
                      if (watch("password") != val) {
                        return "Your passwords do no match";
                      }
                    },
                  })}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={handlePasswordVisibility}
                  >
                    {showPassword ? (
                      <Icon as={AiOutlineEye} />
                    ) : (
                      <Icon as={AiOutlineEyeInvisible} />
                    )}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>
                {errors.confirm && errors.confirm.message}
              </FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              isLoading={isSubmitting}
              width="full"
              mt={4}
            >
              Sign In
            </Button>
          </form>
        </Box>
      </Box>
    </Flex>
  );
};

export default PasswordResetForm;
