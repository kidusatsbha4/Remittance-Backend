import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private repo: Repository<Role>,
  ) {}

  async create(dto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(options: any) {
  const { page, pageSize, search, sortBy, order, ...filters } = options;

  const query = this.repo.createQueryBuilder('role');

  // 🔍 SEARCH
  if (search) {
    query.andWhere(
      '(role.name LIKE :search OR role.description LIKE :search)',
      { search: `%${search}%` },
    );
  }

  // 🎯 FILTERING (dynamic)
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] &&
      !['page', 'page_size', 'search', 'sort_by', 'order'].includes(key)
    ) {
      query.andWhere(`role.${key} = :${key}`, {
        [key]: filters[key],
      });
    }
  });

  // 🔽 SORT
  if (sortBy) {
    query.orderBy(`role.${sortBy}`, order || 'ASC');
  }

  // 📄 PAGINATION
  query.skip((page - 1) * pageSize).take(pageSize);

  const [data, total] = await query.getManyAndCount();

  return {
    data,
    total,
    page,
    pageSize,
  };
}

  async findOne(id: number) {
    const role = await this.repo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async update(id: number, dto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}