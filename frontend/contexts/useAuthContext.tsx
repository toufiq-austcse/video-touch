import React, { useContext, useEffect } from "react";
import { AuthRes, UserRes } from "@/contexts/types/auth-res";
import axios, { AxiosError } from "axios";

type AuthContextType = {
  currentUser: UserRes | null;
  authToken: string | null;
  getCurrentUser: () => void;
  userLogin: (
    email: string,
    password: string,
  ) => Promise<{
    data: AuthRes | null;
    error: string | null;
  }>;
  userSignup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{
    data: AuthRes | null;
    error: string | null;
  }>;
};

const AuthContext = React.createContext({} as AuthContextType);

type AuthProviderProps = {
  children: React.ReactNode;
};
export const useAuthContext = () => {
  return useContext(AuthContext);
};
export const AuthContextProvider = ({ children }: AuthProviderProps) => {
  const [initialLoading, setInitialLoading] = React.useState<boolean>(true);
  const [currentUser, setCurrentUser] = React.useState<UserRes | null>(null);
  const [authToken, setAuthToken] = React.useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    let token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/api/v1/auth/me`;
      try {
        let response = await axios.get(url);
        setCurrentUser(response.data.data);
        setAuthToken(token);
      } catch (err) {
        console.log("err getCurrentUser ", err);
        localStorage.clear();
        location.reload();
      } finally {
        setInitialLoading(false);
      }
    } else {
      setInitialLoading(false);
    }
  };

  const handleError = (err: any) => {
    if (axios.isAxiosError(err)) {
      let error = "";
      let errorResponse: any = (err as AxiosError).response?.data;
      if (errorResponse) {
        error = errorResponse.errors.join(",");
      } else {
        error = (err as AxiosError).message;
      }
      return { data: null, error };
    }
    let message = (err as any).message;
    return { data: null, error: message };
  };

  const userLogin = async (
    email: string,
    password: string,
  ): Promise<{
    data: AuthRes | null;
    error: string | null;
  }> => {
    console.log("userLogin ", process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL);
    try {
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/api/v1/auth/login`;
      const response = await axios.post(url, {
        email: email,
        password: password,
      });

      return {
        data: response.data.data,
        error: null,
      };
    } catch (err) {
      return handleError(err);
    }
  };

  const userSignup = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{
    data: AuthRes | null;
    error: string | null;
  }> => {
    try {
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/api/v1/auth/signup`;
      const response = await axios.post(url, {
        name: name,
        email: email,
        password: password,
      });

      return {
        data: response.data.data,
        error: null,
      };
    } catch (err) {
      return handleError(err);
    }
  };

  const value: AuthContextType = {
    currentUser,
    authToken,
    getCurrentUser,
    userLogin,
    userSignup,
  };
  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children}
    </AuthContext.Provider>
  );
};
