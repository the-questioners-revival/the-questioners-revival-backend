// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from 'src/dto/login.dto';
import { RegisterDto } from 'src/dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register' })
  @ApiCreatedResponse({ description: 'User registered in successfully' })
  @Post('register')
  async register(@Body() registerData: RegisterDto): Promise<UserDto> {
    return this.authService.register(registerData);
  }

  @ApiOperation({ summary: 'Login' })
  @ApiCreatedResponse({ description: 'User logged in successfully' })
  @ApiBadRequestResponse({ description: 'Invalid credentials' })
  @Post('login')
  async login(@Body() loginData: LoginDto): Promise<{ token: string }> {
    const user = await this.authService.validateUser(
      loginData.username,
      loginData.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.authService.generateToken(user);
    return { token };
  }
}
