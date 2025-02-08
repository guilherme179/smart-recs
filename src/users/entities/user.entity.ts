import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // 🚨 Não retorna a senha por padrão
  password: string;

  @Column({ default: 0 }) // 🚨 Não retorna a senha por padrão
  deleted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) { // 🚀 Verifica se já está criptografada
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
