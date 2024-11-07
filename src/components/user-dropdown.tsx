import {
  Menu,
  MenuButton,
  Text,
  MenuList,
  MenuItem,
  Avatar,
  Icon,
  Flex,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { CaretDown, CaretUp, SignOut } from "@phosphor-icons/react";
import { useAuthentication } from "../contexts/authentication";
import { getUserById } from "../api";
import React, { useCallback } from "react";
import Loader from "./loader";

// Memoized component to prevent unnecessary re-renders
const UserDropdown: React.FC = React.memo(() => {
  const { state, signout } = useAuthentication();

  // Fetch user data if authenticated
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", state.isAuthenticated ? state.userId : "anon"],
    queryFn: () => {
      if (state.isAuthenticated) {
        return getUserById(state.token, state.userId);
      }
      return null;
    },
    enabled: state.isAuthenticated,
  });

  // Memoized signout callback
  const handleSignout = useCallback(() => {
    signout();
  }, [signout]);

  // Render nothing if not authenticated or loading
  if (!state.isAuthenticated || isLoading) {
    return <Loader />;
  }

  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <MenuButton>
            <Flex direction="row" alignItems="center">
              <Avatar
                size="xs"
                mr={2}
                name={user?.username}
                src={user?.pictureUrl}
                border="1px solid white"
              />
              <Text color="white">
                {user?.username}
              </Text>
              <Icon color="white" ml={2} as={isOpen ? CaretUp : CaretDown} mt={1} />
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem icon={<Icon as={SignOut} />} onClick={handleSignout}>Sign Out</MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  );
});

export default UserDropdown;