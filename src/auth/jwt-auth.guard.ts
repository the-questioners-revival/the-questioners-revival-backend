// jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    super();
  }

  async getUserFromToken(accessToken: string): Promise<any> {
    const decodedToken: any = this.jwtService.decode(accessToken);
    console.log('decodedToken: ', decodedToken);

    if (!decodedToken) {
      return undefined;
    }

    const parsedId = parseInt(decodedToken.sub);

    if (isNaN(parsedId)) {
      return undefined;
    }

    const user = await this.usersService.getUserById(parsedId);

    if (!user) {
      return false;
    }
    return user;
  }

  async canActivate(context: ExecutionContext) {
    // Add custom logic to check for JWT token in cookies
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['token']; // Assuming the token is stored in a cookie named 'jwt'
    console.log('token: ', token);

    const user = await this.getUserFromToken(token);
    console.log('user: ', user);

    // If user is present, return true, otherwise return false
    return !!user;
  }
}
