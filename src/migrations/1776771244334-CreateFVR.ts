import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFVR1776771244334 implements MigrationInterface {
    name = 'CreateFVR1776771244334'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "otp" text`);
        await queryRunner.query(`ALTER TABLE "user" ADD "otp_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "otp_verified" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "otp_verified"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "otp_expires"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "otp"`);
    }

}
