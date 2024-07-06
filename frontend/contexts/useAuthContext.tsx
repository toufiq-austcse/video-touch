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
  const [loading, setLoading] = React.useState<boolean>(true);
  const [currentUser, setCurrentUser] = React.useState<UserRes | null>(null);
  const [authToken, setAuthToken] = React.useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    let token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/v1/auth/me`;
      try {
        let response = await axios.get(url);
        setCurrentUser(response.data.data);
        setAuthToken(token);
      } catch (err) {
        console.log("err getCurrentUser ", err);
        localStorage.clear();
        location.reload();
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const userLogin = async (
    email: string,
    password: string,
  ): Promise<{
    data: AuthRes | null;
    error: string | null;
  }> => {
    try {
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/v1/auth/login`;
      const response = await axios.post(url, {
        email: email,
        password: password,
      });

      return {
        data: response.data.data,
        error: null,
      };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        let errorResponse: any = (err as AxiosError).response?.data;
        return { data: null, error: errorResponse.errors.join(",") };
      }
      let message = (err as any).message;
      return { data: null, error: message };
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
      let url = `${process.env.NEXT_PUBLIC_VIDEO_TOUCH_API_URL}/v1/auth/signup`;
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
      if (axios.isAxiosError(err)) {
        let errorResponse: any = (err as AxiosError).response?.data;
        return { data: null, error: errorResponse.errors.join(",") };
      }
      let message = (err as any).message;
      return { data: null, error: message };
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
