import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantKey } from './entities/merchant-keys.entity';

@Injectable()
export class MerchantKeysService {
  constructor(
    @InjectRepository(MerchantKey)
    private repo: Repository<MerchantKey>,
  ) {}

  // CREATE (STORE ONLY)
  async create(data: any) {
    const key = this.repo.create({
      ...data,
    });

    return this.repo.save(key);
  }

  // GET ALL
  async findAll(query: any) {
    const { page = 1, pageSize = 10, search } = query;

    const qb = this.repo.createQueryBuilder('mk');

    if (search) {
      qb.where(
        'mk.merchant_name ILIKE :search OR mk.merchant_id ILIKE :search',
        { search: `%${search}%` },
      );
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, pageSize };
  }

  // DETAIL
  async findOne(id: number) {
    const key = await this.repo.findOne({ where: { id } });

    if (!key) throw new NotFoundException('Merchant key not found');

    return key;
  }

  async update(id: number, data: any) {
  const existing = await this.repo.findOne({ where: { id } });

  if (!existing) {
    throw new Error('Merchant key not found');
  }

  // merge safely
  const updated = this.repo.merge(existing, data);

  return this.repo.save(updated); // ✅ IMPORTANT FIX
}

  // DELETE
  async remove(id: number) {
    await this.repo.delete(id);
    return { message: 'Deleted successfully' };
  }

  // TOGGLE STATUS
  async toggleStatus(id: number) {
    const key = await this.findOne(id);
    key.status = !key.status;
    return this.repo.save(key);
  }
}