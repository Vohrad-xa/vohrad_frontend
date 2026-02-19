import {authTokensSchema, userSchema} from '../schemas';

export function validateAuthTokens(tokens: unknown) {
  return authTokensSchema.safeParse(tokens);
}

export function validateUser(user: unknown) {
  return userSchema.safeParse(user);
}

export type {AuthTokens, TokenResponse, User} from '../schemas';
