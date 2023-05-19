import * as fs from 'fs-extra';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  const configService = app.get<ConfigService>(ConfigService);

  // Initialize the Tidal directories
  const tidalDir = configService.get('TIDAL_DIR');
  await fs.ensureDir(`${tidalDir}`);
  await fs.ensureDir(`${tidalDir}/inputs`);
  await fs.ensureDir(`${tidalDir}/outputs`);
  await fs.ensureDir(`${tidalDir}/transcoding`);

  await app.listen(configService.get('PORT') || 5000, '0.0.0.0');
}
bootstrap();
