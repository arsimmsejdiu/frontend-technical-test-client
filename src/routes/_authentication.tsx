import {
  createFileRoute,
  Navigate,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { useAuthentication } from "../contexts/authHooks";

export const Route = createFileRoute("/_authentication")({
  component: function AuthComponent() {
    const { state } = useAuthentication();
    const { pathname } = useLocation();

    if (!state.isAuthenticated) {
      return <Navigate to="/login" search={{ redirect: pathname }} replace />;
    }

    return <Outlet />;
  },
});
