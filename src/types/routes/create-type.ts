import { AuthenticationState } from "../context/authentication-type";

export type Picture = {
  url: string;
  file: File;
};

export type RouterContext = {
  authState: AuthenticationState;
};

export type SearchParams = {
  redirect?: string;
};

export type Inputs = {
  username: string;
  password: string;
};
