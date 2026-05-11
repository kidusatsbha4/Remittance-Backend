import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private repo: Repository<Permission>,
  ) {}

  async create(dto) {
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(options: any) {
  const { page, pageSize, search, sortBy, order, ...filters } = options;

  const query = this.repo.createQueryBuilder('permission');

  // 🔍 SEARCH
  if (search) {
    query.andWhere(
      '(permission.name LIKE :search OR permission.codename LIKE :search OR permission.content_type LIKE :search)',
      { search: `%${search}%` },
    );
  }

  // 🎯 FILTERING (dynamic)
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] &&
      !['page', 'page_size', 'search', 'sort_by', 'order'].includes(key)
    ) {
      query.andWhere(`permission.${key} = :${key}`, {
        [key]: filters[key],
      });
    }
  });

  // 🔽 SORT
  if (sortBy) {
    query.orderBy(`permission.${sortBy}`, order || 'ASC');
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
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Permission not found');
    return item;
  }

  async update(id: number, dto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}