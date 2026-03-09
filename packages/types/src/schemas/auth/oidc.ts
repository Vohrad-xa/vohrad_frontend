import {z} from 'zod';

export const mobileOidcConfigSchema = z.strictObject({
  issuerUrl: z.url(),
  mobileClientId: z.string().min(1),
  scopes: z.array(z.string().min(1)).min(1),
  mobileRedirectUri: z.string().min(1).optional(),
});

export const oidcDiscoveryDocumentSchema = z.looseObject({
  issuer: z.url().optional(),
  authorization_endpoint: z.url(),
  token_endpoint: z.url(),
  userinfo_endpoint: z.url().optional(),
  revocation_endpoint: z.url().optional(),
  end_session_endpoint: z.url().optional(),
});

export const oauthTokenErrorSchema = z.strictObject({
  error: z.string().min(1),
  error_description: z.string().min(1).optional(),
  error_uri: z.url().optional(),
});

export type MobileOidcConfig = z.infer<typeof mobileOidcConfigSchema>;
export type OidcDiscoveryDocument = z.infer<typeof oidcDiscoveryDocumentSchema>;
export type OauthTokenError = z.infer<typeof oauthTokenErrorSchema>;
