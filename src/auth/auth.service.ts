// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDto } from 'src/dto/user.dto';
import { RegisterDto } from 'src/dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async decode(accessToken) {
    const decodedToken: any = this.jwtService.decode(accessToken);
    return decodedToken;
  }

  async register(registerData: RegisterDto): Promise<UserDto> {
    const newUser = this.usersService.createUser(registerData);
    return newUser;
  }

  async generateToken(user: UserDto): Promise<string> {
    const payload = { username: user.username, sub: user.id };
    return this.jwtService.sign(payload);
  }

  async validateUser(username: string, password: string): Promise<any> {
    return this.usersService.validateUser(username, password);
  }
}
