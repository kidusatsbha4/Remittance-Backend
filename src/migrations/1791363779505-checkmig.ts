import { MigrationInterface, QueryRunner } from "typeorm";

export class Checkmig1791363779505 implements MigrationInterface {
    name = 'Checkmig1791363779505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "irst_name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "irst_name" character varying(50)`);
    }

}
