import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, CreateUserSchema } from '../dto/create-user.dto';
import { DeleteUserDto, DeleteUserSchema } from '../dto/delete-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email'], // 🚨 Exclui a senha do retorno
      where: {deleted: false}
    });
  }

  async create(userData: CreateUserDto): Promise<Partial<User>> {
    const parsedData = CreateUserSchema.safeParse(userData);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }

    const { email, name, password } = userData;

    const userAlreadyExists = await this.usersRepository.findOne({ where: {email}})
    
    if(userAlreadyExists){
      throw new BadRequestException('Usuario já existe!')
    }

    // 🚨 Garante que password seja uma string válida e aguarda a criptografia
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🚨 Criar usuário corretamente com todos os campos necessários
    const user = this.usersRepository.create({
      email,
      name,
      password: hashedPassword, // Correção: adicionando a senha corretamente
    });

    const savedUser = await this.usersRepository.save(user);

    // 🚨 Remove a senha antes de retornar
    const { password: _, ...result } = savedUser;
    return result;
  }

  async delete(userData: DeleteUserDto): Promise<Partial<User>> {
    // 🚨 Validação com Zod
    const parsedData = DeleteUserSchema.safeParse(userData);
    if (!parsedData.success) {
      throw new BadRequestException(parsedData.error.format());
    }
  
    const { id } = parsedData.data; // 🚀 Agora temos certeza de que `id` é um UUID
  
    // 🚀 Verifica se o usuário existe
    const userAlreadyExists = await this.usersRepository.findOne({ where: { id, deleted: false } });
  
    if (!userAlreadyExists) {
      throw new BadRequestException('Usuário não existe ou já deletado!');
    }
  
    // 🚀 Atualiza o campo deleted para true
    await this.usersRepository.update(id, { deleted: true });
  
    // 🚀 Busca o usuário atualizado
    const updatedUser = await this.usersRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'deleted'], // Remove a senha do retorno
    });
  
    if (!updatedUser) {
      throw new BadRequestException('Erro ao atualizar o usuário!');
    }
  
    return updatedUser;
  }
  
}
