export interface AuthRes {
  _id: string;
  name: string;
  email: string;
  token: Token;
}

export interface Token {
  access_token: string;
  expires_at: number;
}

export interface UserRes {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}
