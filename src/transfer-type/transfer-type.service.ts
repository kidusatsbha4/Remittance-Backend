import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransferType } from './entities/transfer-type.entity';
import { CreateTransferTypeDto } from './dto/create-transfer-type.dto';
import { UpdateTransferTypeDto } from './dto/update-transfer-type.dto';

@Injectable()
export class TransferTypeService {
  constructor(
    @InjectRepository(TransferType)
    private readonly repo: Repository<TransferType>,
  ) {}

  // CREATE
  async create(dto: CreateTransferTypeDto) {
    const exists = await this.repo.findOne({ where: {} });

    if (exists) {
      throw new BadRequestException('Transfer type already exists');
    }

    const data = this.repo.create({
      ...dto,
      status: true,
    });

    return {
      status: 'success',
      data: await this.repo.save(data),
    };
  }

  // GET ALL
  async findAll() {
    const data = await this.repo.find();

    return {
      status: 'success',
      data,
    };
  }

  // GET ONE
  async findOne(id: number) {
    const data = await this.repo.findOne({ where: { id } });

    if (!data) throw new NotFoundException('Not found');

    return  data ;
  }

  // UPDATE
  async update(id: number, dto: UpdateTransferTypeDto) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) throw new NotFoundException('Not found');

    Object.assign(item, dto);

    return {
      status: 'success',
      data: await this.repo.save(item),
    };
  }

  // DELETE
  async remove(id: number) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) throw new NotFoundException('Not found');

    await this.repo.remove(item);

    return {
      status: 'success',
      message: 'Deleted successfully',
    };
  }

  // ACTIVATE
  async activate(id: number) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) throw new NotFoundException('Not found');

    item.status = true;
    await this.repo.save(item);

    return {
      status: 'success',
      message: 'Activated',
      data: item,
    };
  }

  // DEACTIVATE
  async deactivate(id: number) {
    const item = await this.repo.findOne({ where: { id } });

    if (!item) throw new NotFoundException('Not found');

    item.status = false;
    await this.repo.save(item);

    return {
      status: 'success',
      message: 'Deactivated',
      data: item,
    };
  }
}