// transactions.service.ts
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private repo: Repository<Transaction>,
  ) {}

  // ✅ CREATE TRANSACTION
 async create(data: any, user: any) {
  const transaction = this.repo.create({
    ...data,
    sender_id: 35, // ✅ still works
    transaction_ref: 'TX-' + Date.now(),
  });
console.log("transaction",transaction)

  return this.repo.save(transaction);
}

  // ✅ GET ALL (WITH FILTERS)
  async findAll(query: any) {
    const { page = 1, pageSize = 10, status } = query;

    const qb = this.repo.createQueryBuilder('tx');

    if (status) {
      qb.andWhere('tx.status = :status', { status });
    }

    qb.orderBy('tx.created_at', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // ✅ GET ONE
  async findOne(id: number) {
    const tx = await this.repo.findOne({ where: { id } });

    if (!tx) throw new NotFoundException('Transaction not found');

    return tx;
  }

  // ✅ UPDATE
  async update(id: number, data: any) {
    const tx = await this.findOne(id);

    const updated = this.repo.merge(tx, data);

    return this.repo.save(updated);
  }

  // ✅ DELETE
  async remove(id: number) {
    await this.repo.delete(id);
  }

  // ✅ MARK SUCCESS
  async markSuccess(id: number, external_ref: string) {
    const tx = await this.findOne(id);

    tx.status = 'SUCCESS';
    tx.external_ref = external_ref;
    tx.completed_at = new Date();

    return this.repo.save(tx);
  }

  // ❌ MARK FAILED
  async markFailed(id: number, reason: string) {
    const tx = await this.findOne(id);

    tx.status = 'FAILED';
    tx.failure_reason = reason;

    return this.repo.save(tx);
  }

  // ✅ USER TRANSACTIONS
  async myTransactions(user: any) {
    return this.repo.find({
      // where: { sender_id: user.sub },
      where: { sender_id: 1 },
      order: { created_at: 'DESC' },
    });
  }
}