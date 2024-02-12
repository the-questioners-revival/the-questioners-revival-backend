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
    // Extract user information from cookies
    const cookies = req.cookies;
    const token = cookies['token'];

    // Verify the token
    try {
      if (token) {
        const decodedToken: any = this.jwtService.decode(token);
        // Assuming the decoded token contains the user ID
        const userId = decodedToken.sub;

        // Fetch user information from your database using the userId
        const user = await this.usersService.getUserById(userId);

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
