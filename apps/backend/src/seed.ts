/**
 * Idempotent seed: ensures the single app user exists.
 * Run: pnpm --filter backend seed
 * Env: SEED_USER_NAME, SEED_USER_EMAIL, SEED_USER_PASSWORD (from root .env)
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { User, UserDocument } from './users/schemas/user.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const configService = app.get(ConfigService);
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

  const name = configService.get<string>('SEED_USER_NAME', 'Nobel');
  const email = configService
    .get<string>('SEED_USER_EMAIL', 'nobel@memberlounge.app')
    .toLowerCase();
  const password = configService.get<string>('SEED_USER_PASSWORD');

  if (!password) {
    console.error('❌ SEED_USER_PASSWORD is not set in the root .env file.');
    await app.close();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const existing = await userModel.findOne({ email }).exec();

  if (existing) {
    existing.set({ name, passwordHash });
    await existing.save();
    console.log(`✅ Updated existing user: ${email}`);
  } else {
    await userModel.create({ name, email, passwordHash, isActive: true });
    console.log(`✅ Created user: ${email}`);
  }

  await app.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
