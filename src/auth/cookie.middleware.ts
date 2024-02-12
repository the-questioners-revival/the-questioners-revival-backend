// cookie-user.middleware.ts

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'; // Import the jwt library
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CookieUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: any, res: Response, next: NextFunction) {
    const authorizationHeader = req.headers.authorization;

    // Check if the authorization header exists
    if (!authorizationHeader) {
      // Handle the case when the header is missing
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Split the authorization header to get the token
    const [bearer, token] = authorizationHeader.split(' ');

    // Check if the header format is correct
    if (bearer !== 'Bearer' || !token) {
      // Handle the case when the header format is invalid
      return res
        .status(401)
        .json({ error: 'Invalid authorization header format' });
    }

    // Verify the token
    try {
      if (token) {
        const decodedToken: any = this.jwtService.decode(token);
        // Assuming the decoded token contains the user ID
        const userId = decodedToken.sub;

        // Fetch user information from your database using the userId
        const user = await this.usersService.getUserById(userId, userId);

        // Attach user information to the request object
        req.user = user;

        next();
      } else {
        throw new UnauthorizedException('Token is missing');
      }
    } catch (error) {
      // Handle token verification errors
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
