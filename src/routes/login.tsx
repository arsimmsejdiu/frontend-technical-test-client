import {
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Text,
  Input,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { login } from "../api";
import { useEffect } from "react";
import { Inputs, SearchParams } from "../types";
import { renderError } from "../lib/utils";
import { useAuthentication } from "../contexts/authHooks";
import useAuthCheck from "../hook/useAuthCheck";

export const LoginPage: React.FC = () => {
  useAuthCheck();
  const { redirect } = Route.useSearch();
  const { state, authenticate } = useAuthentication();
  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: Inputs) => login(data.username, data.password),
    onSuccess: ({ jwt }) => {
      localStorage.setItem("auth-token", jwt); // Store the token in local storage
      authenticate(jwt); // Update the authentication state
    },
  });

  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    mutate(data);
  };

  useEffect(() => {
    const token = localStorage.getItem("auth-token"); // Retrieve the token from local storage
    if (token && !state.isAuthenticated) {
      authenticate(token); // Update the authentication state
    }
  }, [authenticate, state.isAuthenticated]);

  if (state.isAuthenticated) {
    return <Navigate to={redirect ?? "/"} />;
  }

  return (
    <Flex
      height="full"
      width="full"
      alignItems="center"
      justifyContent="center"
    >
      <Flex
        direction="column"
        bgGradient="linear(to-br, cyan.100, cyan.200)"
        p={8}
        borderRadius={16}
      >
        <Heading as="h2" size="md" textAlign="center" mb={4}>
          Login
        </Heading>
        <Text textAlign="center" mb={4}>
          Welcome back! 👋
          <br />
          Please enter your credentials.
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              bg="white"
              size="sm"
              {...register("username")}
            />
          </FormControl>
          <FormControl isInvalid={error !== null}>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder="Enter your password"
              bg="white"
              size="sm"
              {...register("password")}
            />
            {error !== null && renderError(error)}
          </FormControl>
          <Button
            color="white"
            colorScheme="cyan"
            mt={4}
            type="submit"
            disabled={isPending}
          >
            {isPending ? <Spinner size="sm" /> : "Login"}
          </Button>
        </form>
      </Flex>
    </Flex>
  );
};

export const Route = createFileRoute("/login")({
  validateSearch: (search): SearchParams => {
    return {
      redirect:
        typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  component: LoginPage,
});
