import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.TYPE as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'mssql' | 'oracle', // ✅ Forçando o tipo
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'postgress',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // ⚠️ Apenas para dev! Em produção, use migrations
    }),
  ],
})
export class DatabaseModule {}
