import { useAuthContext } from "@/contexts/useAuthContext";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

type PrivateRouteProps = {
  Component: React.ComponentType<any>;
};

const PrivateRoute = ({ Component }: PrivateRouteProps) => {
  const Auth = (props: any) => {
    const { currentUser } = useAuthContext();
    const router = useRouter();
    // If user is not logged in, return login component

    useEffect(() => {
      if (!currentUser) {
        router.push("/login");
        return;
      }
    }, []);

    return <Component {...props} />;
  };

  return Auth;
};

export default PrivateRoute;
