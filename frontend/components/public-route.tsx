import { useAuthContext } from "@/contexts/useAuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

type PublicRoutePros = {
  Component: React.ComponentType<any>;
};
const PublicRoute = ({ Component }: PublicRoutePros) => {
  const Auth = (props: { props: any }) => {
    const { currentUser } = useAuthContext();
    console.log("currentUser -", currentUser);
    const router = useRouter();

    useEffect(() => {
      if (currentUser) {
        router.push("/");
        return;
      }
    }, []);

    return <Component {...props} />;
  };

  return Auth;
};

export default PublicRoute;
