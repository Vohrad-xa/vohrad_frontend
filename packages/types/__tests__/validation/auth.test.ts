import {describe, it, expect} from '@jest/globals';
import {randomUUID} from 'crypto';
import {
  authTokensSchema,
  userSchema,
  validateAuthTokens,
  validateUser,
  type AuthTokens,
  type User,
} from '@sykamore/types';

type TokenParseResult = ReturnType<typeof authTokensSchema.safeParse>;
type TokenParser = (input: unknown) => TokenParseResult;

type UserParseResult = ReturnType<typeof userSchema.safeParse>;
type UserParser = (input: unknown) => UserParseResult;

const TOKEN_PARSERS: ReadonlyArray<{
  name: string;
  parse: TokenParser;
}> = [
  {name: 'validateAuthTokens', parse: validateAuthTokens},
  {
    name: 'authTokensSchema.safeParse',
    parse: authTokensSchema.safeParse,
  },
];

const USER_PARSERS: ReadonlyArray<{
  name: string;
  parse: UserParser;
}> = [
  {name: 'validateUser', parse: validateUser},
  {name: 'userSchema.safeParse', parse: userSchema.safeParse},
];

const TOKEN_FIXTURE = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  token_type: 'Bearer',
  expires_in: 3600,
  refresh_expires_in: 7200,
} as const;

function buildTokenPayload(overrides: Record<string, unknown> = {}) {
  return {
    ...TOKEN_FIXTURE,
    ...overrides,
  };
}

function buildUserPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    tenant_id: randomUUID(),
    idp_subject: randomUUID(),
    email: 'user@example.com',
    role_name: 'employee',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

function expectTokenSuccess(result: TokenParseResult): AuthTokens {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(
      `Expected token parse success, got: ${JSON.stringify(result.error.issues)}`,
    );
  }
  return result.data;
}

function expectUserSuccess(result: UserParseResult): User {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(
      `Expected user parse success, got: ${JSON.stringify(result.error.issues)}`,
    );
  }
  return result.data;
}

describe('Auth Validation', () => {
  describe('Auth Tokens', () => {
    describe.each(TOKEN_PARSERS)('$name', ({parse}) => {
      it('accepts canonical token payload', () => {
        const parsed = expectTokenSuccess(parse(buildTokenPayload()));

        expect(parsed).toMatchObject(TOKEN_FIXTURE);
      });

      it('accepts keycloak payload with nullable optional token fields', () => {
        const parsed = expectTokenSuccess(
          parse(
            buildTokenPayload({
              refresh_token: null,
              refresh_expires_in: null,
              expires_in: '300',
              session_state: 'f7f77b0c-11fb-42f9-8b57-2d7ca0ef71e8',
              scope: 'openid profile email offline_access',
            }),
          ),
        );

        expect(parsed.refresh_token).toBeUndefined();
        expect(parsed.refresh_expires_in).toBeUndefined();
        expect(parsed.expires_in).toBe(300);
      });

      it('strips unknown keycloak fields', () => {
        const parsed = expectTokenSuccess(
          parse(
            buildTokenPayload({
              scope: 'openid',
              session_state: 'abc123',
            }),
          ),
        );

        expect(parsed).not.toHaveProperty('scope');
        expect(parsed).not.toHaveProperty('session_state');
      });

      it('coerces numeric string token lifetimes and issued_at', () => {
        const parsed = expectTokenSuccess(
          parse(
            buildTokenPayload({
              expires_in: '900',
              refresh_expires_in: '1800',
              issued_at: '1700000000000',
            }),
          ),
        );

        expect(parsed.expires_in).toBe(900);
        expect(parsed.refresh_expires_in).toBe(1800);
        expect(parsed.issued_at).toBe(1700000000000);
      });

      it('rejects payloads missing required token fields', () => {
        const result = parse({access_token: 'token'});

        expect(result.success).toBe(false);
      });
    });
  });

  describe('Users', () => {
    describe.each(USER_PARSERS)('$name', ({parse}) => {
      it('accepts complete user payload', () => {
        const user = buildUserPayload();
        const parsed = expectUserSuccess(parse(user));

        expect(parsed.id).toBe(user.id);
        expect(parsed.email).toBe(user.email);
      });

      it('accepts nullable user fields', () => {
        const parsed = expectUserSuccess(
          parse(
            buildUserPayload({
              tenant_id: null,
              first_name: null,
              last_name: null,
              phone_number: null,
            }),
          ),
        );

        expect(parsed.tenant_id).toBeNull();
        expect(parsed.first_name).toBeNull();
        expect(parsed.last_name).toBeNull();
        expect(parsed.phone_number).toBeNull();
      });

      it('rejects invalid email payload', () => {
        const result = parse(buildUserPayload({email: 'invalid-email'}));

        expect(result.success).toBe(false);
      });

      it('rejects payloads missing required user fields', () => {
        const result = parse({email: 'missing-fields@example.com'});

        expect(result.success).toBe(false);
      });
    });
  });
});
