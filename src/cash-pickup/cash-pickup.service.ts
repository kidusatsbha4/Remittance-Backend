import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashPickup } from './entities/cash-pickup.entity';
import { CreateCashPickupDto } from './dto/create-cash-pickup.dto';
import { UpdateCashPickupDto } from './dto/update-cash-pickup.dto';

@Injectable()
export class CashPickupService {
  constructor(
    @InjectRepository(CashPickup)
    private repo: Repository<CashPickup>,
  ) {}

  // ✅ CREATE WITH USER FROM TOKEN
  async create(dto: CreateCashPickupDto, user: any) {
    const cashPickup = this.repo.create({
      ...dto,
      sender_id: user.sub,
      receiver_status: 'PENDING',
    });

    return this.repo.save(cashPickup);
  }

  // ✅ GET ALL WITH PAGINATION & FILTERS
  async findAll(options: any) {
    const { page, pageSize, search, sortBy, order, ...filters } = options;

    const query = this.repo.createQueryBuilder('cashPickup');

    // 🔍 SEARCH - search by name, phone, or reference
    if (search) {
      query.andWhere(
        `(cashPickup.first_name ILIKE :search 
        OR cashPickup.last_name ILIKE :search 
        OR cashPickup.phone_number ILIKE :search 
        OR cashPickup.external_reference_id ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // 🎯 FILTERS
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        !['page', 'page_size', 'search', 'sort_by', 'order'].includes(key)
      ) {
        query.andWhere(`cashPickup.${key} = :${key}`, {
          [key]: filters[key],
        });
      }
    });

    // 🔽 SORT
    if (sortBy) {
      query.orderBy(`cashPickup.${sortBy}`, order || 'ASC');
    } else {
      query.orderBy('cashPickup.created_at', 'DESC');
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

  // ✅ GET SINGLE BY ID
  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Cash pickup record not found');
    return item;
  }

  // ✅ UPDATE - ONLY ALLOW STATUS UPDATE
  async update(id: number, dto: UpdateCashPickupDto) {
    const record = await this.findOne(id);

    // Only allow status updates
    if (dto.receiver_status) {
      // Validate status transition
      const validStatuses = [
        'PENDING',
        'VERIFIED',
        'PAID',
        'CANCELLED',
        'EXPIRED',
      ];
      if (!validStatuses.includes(dto.receiver_status)) {
        throw new BadRequestException(
          'Invalid receiver status. Must be one of: PENDING, VERIFIED, PAID, CANCELLED, EXPIRED',
        );
      }

      // Set verified_at timestamp when status changes to VERIFIED
      if (
        dto.receiver_status === 'VERIFIED' &&
        record.receiver_status !== 'VERIFIED'
      ) {
        record.verified_at = new Date();
      }

      record.receiver_status = dto.receiver_status;
    }

    return this.repo.save(record);
  }

  // ✅ DELETE BY ID
  async remove(id: number) {
    const record = await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Cash pickup record deleted successfully', id };
  }

  // ✅ GET ALL FOR A SPECIFIC SENDER
  async findBySender(senderId: number, options: any) {
    const { page, pageSize, search, sortBy, order, ...filters } = options;

    const query = this.repo.createQueryBuilder('cashPickup');
    query.where('cashPickup.sender_id = :senderId', { senderId });

    // 🔍 SEARCH
    if (search) {
      query.andWhere(
        `(cashPickup.first_name ILIKE :search 
        OR cashPickup.last_name ILIKE :search 
        OR cashPickup.phone_number ILIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // 🎯 FILTERS
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        !['page', 'page_size', 'search', 'sort_by', 'order'].includes(key)
      ) {
        query.andWhere(`cashPickup.${key} = :${key}`, {
          [key]: filters[key],
        });
      }
    });

    // 🔽 SORT
    if (sortBy) {
      query.orderBy(`cashPickup.${sortBy}`, order || 'ASC');
    } else {
      query.orderBy('cashPickup.created_at', 'DESC');
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
}
