import { jwtDecode } from "jwt-decode";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Authentication, AuthenticationState } from "../types";

export const AuthenticationContext = createContext<Authentication | undefined>(
  undefined,
);

export const AuthenticationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AuthenticationState>({
    isAuthenticated: false,
  });

  // Memoized authenticate function
  const authenticate = useCallback(
    (token: string) => {
      setState({
        isAuthenticated: true,
        token,
        userId: jwtDecode<{ id: string }>(token).id,
      });
      localStorage.setItem("auth-token", token); // Store token in local storage
    },
    [setState],
  );

  // Memoized signout function
  const signout = useCallback(() => {
    setState({ isAuthenticated: false });
    localStorage.removeItem("auth-token"); // Remove token from local storage
  }, [setState]);

  // Retrieve token from local storage on mount
  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (token) {
      authenticate(token);
    }
  }, [authenticate]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({ state, authenticate, signout }),
    [state, authenticate, signout],
  );

  return (
    <AuthenticationContext.Provider value={contextValue}>
      {children}
    </AuthenticationContext.Provider>
  );
};

export function useAuthentication() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error(
      "useAuthentication must be used within an AuthenticationProvider",
    );
  }
  return context;
}

export function useAuthToken() {
  const { state } = useAuthentication();
  if (!state.isAuthenticated) {
    throw new Error("User is not authenticated");
  }
  return state.token;
}