import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);
    
    if (dataSource.isInitialized) {
      console.log('✅ Conexión a PostgreSQL exitosa');
      console.log(`📊 Base de datos: ${dataSource.options.database}`);
      console.log(`🏠 Host: ${(dataSource.options as any).host}:${(dataSource.options as any).port}`);
    } else {
      console.log('❌ Error: DataSource no inicializado');
    }
    
    await app.close();
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.log('\n📝 Asegúrate de que:');
    console.log('   1. PostgreSQL esté corriendo');
    console.log('   2. La base de datos "kredentia" exista');
    console.log('   3. Las credenciales en .env sean correctas');
  }
}

testDatabaseConnection();
