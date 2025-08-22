import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de CORS más permisiva para desarrollo
  app.enableCors({
    origin: true, // Permite cualquier origen en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
  });

  // Configuración de validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: false,
    }),
  );

  // Configuración de Swagger para Privacy Edition
  const config = new DocumentBuilder()
    .setTitle('Kredentia Privacy API - Avalanche Hack2Build')
    .setDescription('Privacy-focused document certification API using EERC20 tokens on Avalanche C-Chain with Zero-Knowledge proofs')
    .setVersion('1.0')
    .addTag('privacy', 'Privacy-preserving document operations')
    .addTag('eerc20', 'Enhanced ERC20 token operations')
    .addTag('zk-proofs', 'Zero-knowledge proof operations')
    .addTag('avalanche', 'Avalanche C-Chain integration')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🔒 Kredentia Privacy Edition iniciada en http://localhost:${port}`);
  console.log(`📚 Documentación Swagger disponible en http://localhost:${port}/api`);
  console.log(`⛓️ Avalanche Hack2Build: Privacy Edition`);
  console.log(`🛡️ EERC20 Privacy Tokens & Zero-Knowledge Proofs`);
  console.log(`💾 Usando base de datos SQLite: database.sqlite`);
}
bootstrap();
