import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginLog, LoginLogDocument } from './schemas/login-log.schema';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectModel(LoginLog.name)
    private readonly loginLogModel: Model<LoginLogDocument>,
  ) {}

  async login(loginDto: LoginDto, userAgent?: string): Promise<LoginResponse> {
    const user = await this.usersService.findByEmailWithPassword(
      loginDto.email,
    );
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userId = String(user._id);
    await this.loginLogModel.create({ userId, userAgent });

    const payload: JwtPayload = { sub: userId, email: user.email };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: { id: userId, name: user.name, email: user.email },
    };
  }

  async getLoginStats(userId: string) {
    const [totalLogins, lastTwo] = await Promise.all([
      this.loginLogModel.countDocuments({ userId }).exec(),
      this.loginLogModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean()
        .exec(),
    ]);
    // lastTwo[0] is the login that started this session; [1] is the previous one
    const previous = (lastTwo[1] ?? lastTwo[0]) as
      | (LoginLog & { createdAt?: Date })
      | undefined;
    return {
      totalLogins,
      lastLoginAt: previous?.createdAt ?? null,
    };
  }
}
