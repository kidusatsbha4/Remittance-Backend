import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manual } from './entities/manual.entity';
import { Repository } from 'typeorm';
import { InternalTransferDto } from '../internal-transfer/dto/internal-transfer.dto';
import { InternalTransferService } from '../internal-transfer/internal-transfer.service';
import { TransactionsService } from '../transactions/transactions.service';
import { response } from 'express';

@Injectable()
export class ManualService {
  constructor(
    @InjectRepository(Manual)
    private repo: Repository<Manual>,
    private internalTransferService: InternalTransferService,
               private transactionsService: TransactionsService,
  ) {}

   // ✅ CREATE WITH USER FROM TOKEN
  async create(data: any, user: any) {
  const manual = this.repo.create({
    ...data,
     sender_id: user.sub,
    
   
  });
console.log("transaction",manual)

  return this.repo.save(manual);
}

  async findAll(options: any) {
    const { page, pageSize, search, sortBy, order, ...filters } = options;

    const query = this.repo.createQueryBuilder('manual');

    // 🔍 SEARCH
    if (search) {
      query.andWhere(
        `(manual.toAccount LIKE :search 
        OR manual.toAccountHolder LIKE :search 
        OR manual.external_ref LIKE :search)`,
        { search: `%${search}%` },
      );
    }

    // 🎯 FILTERS
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] &&
        !['page', 'page_size', 'search', 'sort_by', 'order'].includes(key)
      ) {
        query.andWhere(`manual.${key} = :${key}`, {
          [key]: filters[key],
        });
      }
    });

    // 🔽 SORT
    if (sortBy) {
      query.orderBy(`manual.${sortBy}`, order || 'ASC');
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
    const item = await this.repo.findOne({ 
      where: { id },
      relations: ['sender_id'] // ✅ Load the sender_id relationship
    });
    console.log("item",item)
    if (!item) throw new NotFoundException('Manual record not found');
    return item;
  }

  async update(id: number, dto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  // ✅ CHANGE STATUS → PAID
  async markAsPaid(id: number, user: any) {
    const record = await this.findOne(id);

    // Extract sender_id - record.sender_id is now a User object with .id property
    let sender_id: number;
    
    if (typeof record.sender_id === 'object' && record.sender_id?.id) {
      sender_id = record.sender_id.id;
    } else if (typeof record.sender_id === 'number') {
      sender_id = record.sender_id;
    } else {
      sender_id = user?.sub;
    }

    if (!sender_id) {
      throw new Error('Cannot determine sender ID for transaction');
    }

    console.log('Using sender_id:', sender_id);

    const fromAccount = '0083920830101';
    const fromAccountHolder = 'MELAT TESFAYE BIREMJI';
    const toAccount = record.toAccount;
    const toAccountHolder = record.toAccountHolder;
    const currency = record.currency;
    const toCurrency = record.toCurrency;
    const amount = String(record.amount);
    const remark = record.remark;
    const exchange_rate = record.exchange_rate;
    const external_ref = record.external_ref;
    const eCurrency = record.eCurrency;
   const bonus = record.bonus;
    const transferDto: InternalTransferDto = {
      fromAccount,
      fromAccountHolder,
      toAccount,
      toAccountHolder,
      currency,
      toCurrency,
      amount,
      remark,
    };

    console.log('transferDto', transferDto);
    // 🔥 CALL INTERNAL TRANSFER
    const transferResponse =
      await this.internalTransferService.transfer(transferDto);

    // =========================================
    // 🔥 CHECK TRANSFER RESPONSE
    // =========================================
    console.log('transferResponse', transferResponse);
    console.log('transferResponse.status', transferResponse.status);

    if (transferResponse.status !==true) {
      throw new Error('Transfer failed: ' + (transferResponse.statusDesc || 'Unknown error'));
    }

    // =========================================
    // 🔥 SAVE TRANSACTION
    // =========================================
    const transaction = await this.transactionsService.create(
      {
        beneficiary_acc: toAccount,
        amount,
        currency: eCurrency,
        exchange_rate: exchange_rate || null,
        status: 'PAID',
        channel: 'card',
        external_ref,
        failure_reason: null,
        completed_at: new Date(),
        bonus
      },
      { sub: sender_id }, // ✅ Pass user object format that transactionsService expects
    );

    if (transferResponse.status) {
      record.status = 'paid';
      return this.repo.save(record);
    } else {
      throw new Error('Transfer failed: ' + (transferResponse.statusDesc || 'Unknown error'));
    }
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}