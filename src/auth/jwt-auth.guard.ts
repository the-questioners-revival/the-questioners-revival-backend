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

  async canActivate(context: ExecutionContext) {
    // Add custom logic to check for JWT token in cookies
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // If user is present, return true, otherwise return false
    return !!user;
  }
}
