import crypto from 'crypto';
import https from 'https';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GlobalSignOutCommand,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { env } from '../config/env';
import { User } from '../models/User.model';
import type { RegisterInput, ConfirmEmailInput, LoginInput, ResetPasswordInput } from '../schemas/auth.schema';

// Force IPv4 — IPv6 path to Cognito is unreachable on this network
const ipv4Agent = new https.Agent({ family: 4 });

const cognito = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
  requestHandler: new NodeHttpHandler({ httpsAgent: ipv4Agent }),
  credentials: env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        sessionToken: env.AWS_SESSION_TOKEN,
      }
    : undefined,
});

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { status });
}

function cognitoError(err: unknown): never {
  const e = err as { name?: string; message?: string; code?: string };
  if (e.code === 'ETIMEDOUT' || e.name === 'TimeoutError') {
    fail('AWS service is unreachable — check that your credentials are still valid and not expired.', 503);
  }
  fail(e.message || e.name || 'AWS Cognito error', 400);
}

// Required when Cognito App Client has a client secret configured
function secretHash(username: string): string | undefined {
  if (!env.COGNITO_CLIENT_SECRET) return undefined;
  return crypto
    .createHmac('sha256', env.COGNITO_CLIENT_SECRET)
    .update(username + env.COGNITO_CLIENT_ID)
    .digest('base64');
}

export const authService = {
  async register(input: RegisterInput) {
    // Only talk to Cognito here — MongoDB user is upserted on first login.
    // This keeps registration working even when Atlas is temporarily unreachable.
    await cognito.send(
      new SignUpCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        SecretHash: secretHash(input.email),
        Username: input.email,
        Password: input.password,
        UserAttributes: [
          { Name: 'name',  Value: input.name },
          { Name: 'email', Value: input.email },
          ...(input.phone ? [{ Name: 'phone_number', Value: input.phone }] : []),
        ],
      }),
    ).catch(cognitoError);

    return { message: 'Account created. Check your email for a 6-digit verification code.' };
  },

  async confirmEmail(input: ConfirmEmailInput) {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        SecretHash: secretHash(input.email),
        Username: input.email,
        ConfirmationCode: input.code,
      }),
    ).catch(cognitoError);

    return { message: 'Email verified. You can now log in.' };
  },

  async resendCode(email: string) {
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        SecretHash: secretHash(email),
        Username: email,
      }),
    ).catch(cognitoError);

    return { message: 'Verification code resent.' };
  },

  async login(input: LoginInput) {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: env.COGNITO_CLIENT_ID,
        AuthParameters: {
          USERNAME: input.email,
          PASSWORD: input.password,
          ...(secretHash(input.email) ? { SECRET_HASH: secretHash(input.email)! } : {}),
        },
      }),
    ).catch(cognitoError);

    const tokens = result.AuthenticationResult;
    if (!tokens) fail('Authentication failed', 401);

    // Decode Cognito ID token (trusted — issued by our own user pool) to get user attributes
    const idPayload = JSON.parse(
      Buffer.from(tokens.IdToken!.split('.')[1], 'base64').toString('utf8'),
    ) as { sub: string; name?: string; email: string; phone_number?: string };

    // Upsert MongoDB profile — created here on first login after email verification
    const user = await User.findOneAndUpdate(
      { cognitoSub: idPayload.sub },
      {
        $setOnInsert: {
          cognitoSub:   idPayload.sub,
          name:         idPayload.name ?? input.email,
          email:        idPayload.email,
          phone:        idPayload.phone_number,
        },
      },
      { upsert: true, new: true },
    );

    return {
      accessToken:  tokens.AccessToken!,
      idToken:      tokens.IdToken!,
      refreshToken: tokens.RefreshToken!,
      expiresIn:    tokens.ExpiresIn!,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    };
  },

  async refresh(refreshToken: string, username?: string) {
    const hash = username ? secretHash(username) : undefined;
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: env.COGNITO_CLIENT_ID,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken,
          ...(hash ? { SECRET_HASH: hash } : {}),
        },
      }),
    ).catch(() => fail('Invalid or expired refresh token', 401));

    const tokens = result.AuthenticationResult;
    if (!tokens) fail('Token refresh failed', 401);

    return {
      accessToken: tokens.AccessToken!,
      idToken:     tokens.IdToken!,
      expiresIn:   tokens.ExpiresIn!,
    };
  },

  async logout(accessToken: string) {
    // GlobalSignOut invalidates ALL sessions for this user in Cognito
    await cognito.send(new GlobalSignOutCommand({ AccessToken: accessToken })).catch(() => {});
  },

  async forgotPassword(email: string) {
    await cognito.send(
      new ForgotPasswordCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        SecretHash: secretHash(email),
        Username: email,
      }),
    ).catch(() => {}); // Always succeed — don't reveal if email exists

    return { message: 'If that account exists, a 6-digit reset code has been sent to your email.' };
  },

  async resetPassword(input: ResetPasswordInput) {
    await cognito.send(
      new ConfirmForgotPasswordCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        SecretHash: secretHash(input.email),
        Username: input.email,
        ConfirmationCode: input.code,
        Password: input.password,
      }),
    ).catch(cognitoError);

    return { message: 'Password reset successful. You can now log in.' };
  },
};
