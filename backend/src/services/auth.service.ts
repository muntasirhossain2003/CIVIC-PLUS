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
import { env } from '../config/env';
import { User } from '../models/User.model';
import { RegisterInput, ConfirmEmailInput, LoginInput, ResetPasswordInput } from '../schemas/auth.schema';

const cognito = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
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

export const authService = {
  async register(input: RegisterInput) {
    const { UserSub } = await cognito.send(
      new SignUpCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        Username: input.email,
        Password: input.password,
        UserAttributes: [
          { Name: 'name',  Value: input.name },
          { Name: 'email', Value: input.email },
          ...(input.phone ? [{ Name: 'phone_number', Value: input.phone }] : []),
        ],
      }),
    ).catch((err) => fail(err.message ?? 'Registration failed', 400));

    // Create MongoDB profile immediately — linked by Cognito sub
    await User.create({
      cognitoSub: UserSub,
      name:  input.name,
      email: input.email,
      phone: input.phone,
    });

    return { message: 'Account created. Check your email for a 6-digit verification code.' };
  },

  async confirmEmail(input: ConfirmEmailInput) {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        Username: input.email,
        ConfirmationCode: input.code,
      }),
    ).catch((err) => fail(err.message ?? 'Confirmation failed', 400));

    return { message: 'Email verified. You can now log in.' };
  },

  async resendCode(email: string) {
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        Username: email,
      }),
    ).catch((err) => fail(err.message ?? 'Could not resend code', 400));

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
        },
      }),
    ).catch((err) => fail(err.message ?? 'Invalid email or password', 401));

    const tokens = result.AuthenticationResult;
    if (!tokens) fail('Authentication failed', 401);

    const user = await User.findOne({ email: input.email });
    if (!user) fail('User profile not found', 404);

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

  async refresh(refreshToken: string) {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: env.COGNITO_CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
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
        Username: email,
      }),
    ).catch(() => {}); // Always succeed — don't reveal if email exists

    return { message: 'If that account exists, a 6-digit reset code has been sent to your email.' };
  },

  async resetPassword(input: ResetPasswordInput) {
    await cognito.send(
      new ConfirmForgotPasswordCommand({
        ClientId: env.COGNITO_CLIENT_ID,
        Username: input.email,
        ConfirmationCode: input.code,
        Password: input.password,
      }),
    ).catch((err) => fail(err.message ?? 'Invalid or expired code', 400));

    return { message: 'Password reset successful. You can now log in.' };
  },
};
