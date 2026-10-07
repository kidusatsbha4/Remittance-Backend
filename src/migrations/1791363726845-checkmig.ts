import { MigrationInterface, QueryRunner } from "typeorm";

export class Checkmig1791363726845 implements MigrationInterface {
    name = 'Checkmig1791363726845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "irst_name" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "irst_name"`);
    }

}
