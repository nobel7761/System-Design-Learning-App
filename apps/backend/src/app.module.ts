import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

// Resolve .env file path - try multiple locations
const getEnvPath = (): string => {
  // Try root directory (when running from monorepo root)
  const rootEnv = resolve(process.cwd(), '.env');
  if (existsSync(rootEnv)) {
    return rootEnv;
  }

  // Try going up from apps/backend (when running from backend directory)
  const backendRootEnv = resolve(process.cwd(), '../..', '.env');
  if (existsSync(backendRootEnv)) {
    return backendRootEnv;
  }

  // Try from __dirname (compiled dist folder)
  const distRootEnv = resolve(__dirname, '../../../.env');
  if (existsSync(distRootEnv)) {
    return distRootEnv;
  }

  // Try from src folder
  const srcRootEnv = resolve(__dirname, '../../..', '.env');
  if (existsSync(srcRootEnv)) {
    return srcRootEnv;
  }

  // Fallback to cwd
  return resolve(process.cwd(), '.env');
};

const envPath = getEnvPath();
console.log('🔍 Looking for .env file at:', envPath);
console.log('📁 Current working directory:', process.cwd());
console.log('📁 __dirname:', __dirname);

if (!existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  console.error(
    '💡 Please ensure .env file exists in the root directory (turborepo-next-nest/.env)',
  );
} else {
  console.log('✅ Found .env file at:', envPath);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envPath,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error(
            'MONGODB_URI is not defined. Please create a .env file in the root directory with MONGODB_URI=mongodb+srv://...',
          );
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
