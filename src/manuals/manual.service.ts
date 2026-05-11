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
    sender_id: 35,
   
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
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Manual record not found');
    return item;
  }

  async update(id: number, dto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  // ✅ CHANGE STATUS → PAID
  async markAsPaid(id: number) {
    const record = await this.findOne(id);

    
const fromAccount = '0083920830101';
const fromAccountHolder = 'MELAT TESFAYE BIREMJI';
        const toAccount =record.toAccount;
        const toAccountHolder= record.toAccountHolder;
        const currency =record.currency;
        const toCurrency=record.toCurrency;
        const amount ="100";
        const remark=record.remark;
        const sender_id=record.sender_id
        const exchange_rate=record.exchange_rate
        const external_ref =record.external_ref

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
        
        console.log("transferDto",transferDto)
                // 🔥 CALL INTERNAL TRANSFER
                const transferResponse =
                  await this.internalTransferService.transfer(transferDto);
        
                // =========================================
                // 🔥 CHECK TRANSFER RESPONSE
                // =========================================
                console.log("transferResponse",transferResponse)
                console.log("transferResponse.data.status",transferResponse.status)
        //         if (!transferResponse.status) {
        //   return transferResponse
        // }
        // resolve(transferResponse);
        
                const txData = transferResponse.data;
        
                // =========================================
                // 🔥 SAVE TRANSACTION
                // =========================================
                const transaction=await this.transactionsService.create(
                  {
                    beneficiary_acc: toAccount,
                    amount,
                    currency: 'ETB',
                    exchange_rate: exchange_rate || null,
                    status: 'PAID', // ✅ UPDATED
                    channel: 'card',
                    external_ref, // ✅ from CyberSource
                    failure_reason: null,
                    completed_at: new Date()
                    
                  },
                  sender_id
                );
        
        //         return resolve({
          
        //     transferResponse,
        //     transaction,
          
        // });
        
if (transferResponse.status){
        record.status = 'paid';

   return this.repo.save(record);
    
}

else {
    
}


  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
}