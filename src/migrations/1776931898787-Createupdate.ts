import { MigrationInterface, QueryRunner } from "typeorm";

export class Createupdate1776931898787 implements MigrationInterface {
    name = 'Createupdate1776931898787'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_kyc" DROP CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd"`);
        await queryRunner.query(`ALTER TABLE "users_kyc" ADD CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_kyc" DROP CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd"`);
        await queryRunner.query(`ALTER TABLE "users_kyc" ADD CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
