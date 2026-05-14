import {
  Injectable,
  NotFoundException,BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Bonus } from './entities/bonus.entity';
import { CreateBonusDto } from './dto/create-bonus.dto';
import { UpdateBonusDto } from './dto/update-bonus.dto';

@Injectable()
export class BonusService {
  constructor(
    @InjectRepository(Bonus)
    private readonly bonusRepository: Repository<Bonus>,
  ) {}

  // CREATE
   async create(createBonusDto: CreateBonusDto) {
    const existingBonus = await this.bonusRepository.findOne({
      where: {},
    });

    if (existingBonus) {
      throw new BadRequestException(
        'Bonus record already exists. Please update the existing record.',
      );
    }

    const bonus = this.bonusRepository.create({
      ...createBonusDto,
      status: true,
    });

    const savedBonus = await this.bonusRepository.save(bonus);

    return {
      status: 'success',
      data: savedBonus,
    };
  }

  // GET ALL WITH PAGINATION, SEARCH, SORT
  async findAll(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
    status?: boolean;
  }) {
    const {
      page = 1,
      pageSize = 10,
      search,
      sortBy = 'id',
      order = 'DESC',
      status,
    } = options;

    const where: any = {};

    if (search) {
      where.description = Like(`%${search}%`);
    }

    if (status !== undefined) {
      where.status = status;
    }

    const [data, total] = await this.bonusRepository.findAndCount({
      where,
      order: {
        [sortBy]: order,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  // GET SINGLE BONUS
  async findOne(id: number) {
    const bonus = await this.bonusRepository.findOne({
      where: { id },
    });

    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }

    return bonus;
  }

  // UPDATE BONUS
  async update(id: number, updateBonusDto: UpdateBonusDto) {
    const bonus = await this.bonusRepository.preload({
      id,
      ...updateBonusDto,
    });

    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }

    const updatedBonus = await this.bonusRepository.save(bonus);

    return {
      status: 'success',
      data: updatedBonus,
    };
  }

  // DELETE BONUS
  async remove(id: number) {
    const bonus = await this.bonusRepository.findOne({
      where: { id },
    });

    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }

    await this.bonusRepository.remove(bonus);

    return {
      status: 'success',
      message: 'Bonus deleted successfully',
    };
  }

  // ACTIVATE BONUS
  async activate(id: number) {
    const bonus = await this.bonusRepository.findOne({
      where: { id },
    });

    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }

    bonus.status = true;
    await this.bonusRepository.save(bonus);

    return {
      status: 'success',
      message: 'Bonus activated successfully',
      data: bonus,
    };
  }

  // DEACTIVATE BONUS
  async deactivate(id: number) {
    const bonus = await this.bonusRepository.findOne({
      where: { id },
    });

    if (!bonus) {
      throw new NotFoundException(`Bonus with ID ${id} not found`);
    }

    bonus.status = false;
    await this.bonusRepository.save(bonus);

    return {
      status: 'success',
      message: 'Bonus deactivated successfully',
      data: bonus,
    };
  }
}