import { Injectable, NotFoundException,BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { UpdateRolePermissionDto } from './dto/update-role-permission.dto';
@Injectable()
export class RolePermissionsService {
  constructor(
    @InjectRepository(RolePermission)
    private repo: Repository<RolePermission>,
  ) {}

  async create(dto: any) {
  const { role_id, permission_id } = dto;

  // 🔍 check if already exists
  const existing = await this.repo.findOne({
    where: {
      role: { id: role_id },
      permission: { id: permission_id },
    },
  });

  if (existing) {
    throw new BadRequestException('Permission already assigned to this role');
  }

  const entity = this.repo.create({
    role: { id: role_id },
    permission: { id: permission_id },
  });

  return this.repo.save(entity);
}
async managePermissions(dto: UpdateRolePermissionDto) {
  const { role_id } = dto;

  let addIds = dto.add_permission_ids || [];
  let removeIds = dto.remove_permission_ids || [];

  // 🧠 1. REMOVE duplicates between add & remove
  const intersection = addIds.filter((id) => removeIds.includes(id));

  if (intersection.length > 0) {
    // remove from both → no-op
    addIds = addIds.filter((id) => !intersection.includes(id));
    removeIds = removeIds.filter((id) => !intersection.includes(id));
  }

  // 🔍 2. GET CURRENT PERMISSIONS
  const existing = await this.repo.find({
    where: { role: { id: role_id } },
    relations: ['permission'],
  });

  const existingIds = existing.map((e) => e.permission.id);

  // 🔴 3. FILTER VALID REMOVALS
  const validRemoveIds = removeIds.filter((id) =>
    existingIds.includes(id),
  );

  if (validRemoveIds.length > 0) {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('role_id = :role_id', { role_id })
      .andWhere('permission_id IN (:...ids)', { ids: validRemoveIds })
      .execute();
  }

  // 🟢 4. FILTER VALID ADDITIONS
  const validAddIds = addIds.filter(
    (id) => !existingIds.includes(id),
  );

  if (validAddIds.length > 0) {
    const newRecords = validAddIds.map((pid) =>
      this.repo.create({
        role: { id: role_id },
        permission: { id: pid },
      }),
    );

    await this.repo.save(newRecords);
  }

  // 📊 5. RESPONSE SUMMARY (VERY PROFESSIONAL 🔥)
  return {
    message: 'Permissions updated successfully',
    added: validAddIds,
    removed: validRemoveIds,
    ignored: {
      already_assigned: addIds.filter((id) =>
        existingIds.includes(id),
      ),
      not_found_for_removal: removeIds.filter(
        (id) => !existingIds.includes(id),
      ),
      conflicted: intersection,
    },
    data: await this.repo.find({
      where: { role: { id: role_id } },
      relations: ['role', 'permission'],
    }),
  };
}
  async findAll(options: any) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'id',
      order = 'ASC',
    } = options;

    const query = this.repo.createQueryBuilder('rp')
      .leftJoinAndSelect('rp.role', 'role')
      .leftJoinAndSelect('rp.permission', 'permission');

    query.orderBy(`rp.${sortBy}`, order);
    query.skip((page - 1) * pageSize).take(pageSize);

    const [data, total] = await query.getManyAndCount();

    return { data, total, page, pageSize };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['role', 'permission'],
    });

    if (!item) {
      throw new NotFoundException('RolePermission not found');
    }

    return item;
  }

  async update(id: number, dto: any) {
    await this.repo.update(id, {
      role: { id: dto.role_id },
      permission: { id: dto.permission_id },
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
  }
  async getPermissionsByRole(roleId: number) {
  const rolePermissions = await this.repo.find({
    where: { role: { id: roleId } },
    relations: ['permission'],
  });

  if (!rolePermissions.length) {
    throw new NotFoundException('No permissions found for this role');
  }

  return rolePermissions.map(rp => rp.permission);
}

async getRolesByPermission(permissionId: number) {
  const rolePermissions = await this.repo.find({
    where: { permission: { id: permissionId } },
    relations: ['role'],
  });

  if (!rolePermissions.length) {
    throw new NotFoundException('No roles found for this permission');
  }

  return rolePermissions.map(rp => rp.role);
}


}

