import { useEffect } from "react";

const useAuthCheck = () => {

  useEffect(() => {
    const token = localStorage.getItem("auth-token");
    if (!token) {
        window.location.href = "/";
    }
  }, []);
};

export default useAuthCheck;