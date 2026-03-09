import {z} from 'zod';

export const mobileOidcConfigSchema = z.strictObject({
  issuerUrl: z.string().url(),
  mobileClientId: z.string().min(1),
  scopes: z.array(z.string().min(1)).min(1),
  mobileRedirectUri: z.string().min(1).optional(),
});

export const oidcDiscoveryDocumentSchema = z.looseObject({
  issuer: z.string().url().optional(),
  authorization_endpoint: z.string().url(),
  token_endpoint: z.string().url(),
  userinfo_endpoint: z.string().url().optional(),
  revocation_endpoint: z.string().url().optional(),
  end_session_endpoint: z.string().url().optional(),
});

export type MobileOidcConfig = z.infer<typeof mobileOidcConfigSchema>;
export type OidcDiscoveryDocument = z.infer<typeof oidcDiscoveryDocumentSchema>;
