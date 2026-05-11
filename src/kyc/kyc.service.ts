import {
  Injectable,
  NotFoundException,ConflictException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Kyc } from './entities/kyc.entity';

@Injectable()
export class KycService {
  constructor(
    @InjectRepository(Kyc)
    private kycRepository: Repository<Kyc>,
  ) {}

  async create(data: any, files: any) {
    const existing = await this.kycRepository.findOne({
      where: { user_id: data.user_id },
    });

    if (existing) {
      throw new ConflictException('KYC already exists for this user');
    }

    const kyc = this.kycRepository.create({
      ...data,
      id_photo_path: files?.id_photo?.[0]
        ? `uploads/kyc/${files.id_photo[0].filename}`
        : null,
      selfie_photo_path: files?.selfie?.[0]
        ? `uploads/kyc/${files.selfie[0].filename}`
        : null,
    });

    return this.kycRepository.save(kyc);
  }

  // ✅ UPDATED: helper for formatting response
  private formatKyc(kyc: Kyc, req: any) {
    const baseUrl = `${req.protocol}://${req.get('host')}/`;

    return {
      ...kyc,
      id_photo_path: kyc.id_photo_path
        ? baseUrl + kyc.id_photo_path
        : null,
      selfie_photo_path: kyc.selfie_photo_path
        ? baseUrl + kyc.selfie_photo_path
        : null,
    };
  }

  // ✅ UPDATED: clean findAll using formatter
  async findAll(query: any, req: any) {
    const { page = 1, pageSize = 10, verified } = query;

    const qb = this.kycRepository.createQueryBuilder('kyc').
    leftJoinAndSelect('kyc.user', 'user');

    if (verified !== undefined) {
      qb.andWhere('kyc.verified = :verified', { verified });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    const formatted = data.map((item) =>
      this.formatKyc(item, req),
    );

    return {
      data: formatted,
      total,
      page,
      pageSize,
    };
  }

  // ✅ UPDATED: PURE entity method (no req here)
  async findOne(id: number): Promise<Kyc> {
    const kyc = await this.kycRepository.findOne({
      where: { id },
    relations: ['user'],
    });

    if (!kyc) throw new NotFoundException('KYC not found');

    return kyc;
  }

  // ✅ UPDATED: separate API method with URL
  async findOneWithUrl(id: number, req: any) {
    const kyc = await this.findOne(id);
    return this.formatKyc(kyc, req);
  }

  async update(id: number, data: any, files?: any) {
  const kyc = await this.findOne(id);

  // ✅ update normal fields
  Object.assign(kyc, data);

  // ✅ update files if provided
  if (files?.id_photo?.[0]) {
    kyc.id_photo_path = `uploads/kyc/${files.id_photo[0].filename}`;
  }

  if (files?.selfie?.[0]) {
    kyc.selfie_photo_path = `uploads/kyc/${files.selfie[0].filename}`;
  }

  return this.kycRepository.save(kyc);
}

  async remove(id: number) {
    await this.kycRepository.delete(id);
  }

  async verify(id: number) {
    const kyc = await this.findOne(id); // ✅ safe now

    kyc.verified = true;
    kyc.verified_at = new Date();

    return this.kycRepository.save(kyc);
  }

  async unverify(id: number) {
    const kyc = await this.findOne(id); // ✅ safe now

    kyc.verified = false;
    kyc.verified_at = null;

    return this.kycRepository.save(kyc);
  }
}