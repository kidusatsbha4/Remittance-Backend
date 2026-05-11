import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private repo: Repository<UserRole>,
  ) {}

  async create(dto: any) {
  const { user_id, role_id } = dto;

  // 🔍 check if already exists
  const existing = await this.repo.findOne({
    where: {
      user: { id: user_id },
      role: { id: role_id },
    },
    relations: ['user', 'role'],
  });

  if (existing) {
    throw new BadRequestException('Role already assigned to this user');
  }

  const entity = this.repo.create({
    user: { id: user_id },
    role: { id: role_id },
  });

  return this.repo.save(entity);
}

  async findAll(options: any) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      order = 'ASC',
    } = options;

    const query = this.repo.createQueryBuilder('ur')
      .leftJoinAndSelect('ur.user', 'user')
      .leftJoinAndSelect('ur.role', 'role');

    query.orderBy(`ur.${sortBy}`, order);
    query.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['user', 'role'],
    });

    if (!item) {
      throw new NotFoundException('UserRole not found');
    }

    return item;
  }

  async update(id: number, dto: any) {
    await this.repo.update(id, {
      user: { id: dto.user_id },
      role: { id: dto.role_id },
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }

  async getRolesByUser(userId: number) {
  const userRoles = await this.repo.find({
    where: { user: { id: userId } },
    relations: ['role'],
  });

  if (!userRoles.length) {
    throw new NotFoundException('No roles found for this user');
  }

  return userRoles.map(ur => ur.role);
}

async getUsersByRole(roleId: number) {
  const userRoles = await this.repo.find({
    where: { role: { id: roleId } },
    relations: ['user'],
  });

  if (!userRoles.length) {
    throw new NotFoundException('No users found for this role');
  }

  return userRoles.map(ur => ur.user);
}

}