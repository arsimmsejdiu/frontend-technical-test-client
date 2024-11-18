import {
  Flex,
  Heading,
  Button,
  Icon,
  HStack,
  StackDivider,
} from "@chakra-ui/react";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import UserDropdown from "../components/user-dropdown";
import { Plus } from "@phosphor-icons/react";
import { RouterContext } from "../types";
import { useAuthentication } from "../contexts/authHooks";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: function ComponentName() {
    const { state } = useAuthentication();
    return (
      <Flex width="full" height="full" direction="column">
        {/* Header */}
        <Flex
          bgColor="cyan.600"
          p={2}
          justifyContent="space-between"
          boxShadow="md"
        >
          {/* Title */}
          <Heading cursor="pointer" size="lg" color="white" onClick={() => window.location.href = "/"}>
            MemeFactory
          </Heading>
          {state.isAuthenticated && (
            <HStack
              alignItems="center"
              divider={<StackDivider border="white" />}
            >
              <Button
                as={Link}
                size="sm"
                leftIcon={<Icon as={Plus} />}
                to="/create"
              >
                Create a meme
              </Button>
              <UserDropdown />
            </HStack>
          )}
        </Flex>
        <Flex flexGrow={1} height={0}>
          <Outlet />
        </Flex>
      </Flex>
    );
  },
});
