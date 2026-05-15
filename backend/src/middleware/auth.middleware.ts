import { Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { AuthRequest } from '../types/index.d';

const verifier = CognitoJwtVerifier.create({
  userPoolId: env.COGNITO_USER_POOL_ID,
  clientId:   env.COGNITO_CLIENT_ID,
  tokenUse:   'access',
});

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }

  try {
    const payload = await verifier.verify(header.slice(7));

    // Load the MongoDB profile using the Cognito sub (UUID)
    const user = await User.findOne({ cognitoSub: payload.sub });
    if (!user) {
      res.status(401).json({ message: 'User profile not found' });
      return;
    }

    req.user = {
      id:           user._id.toString(),
      role:         user.role,
      departmentId: user.departmentId?.toString(),
    };

    next();
  } catch {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
}
