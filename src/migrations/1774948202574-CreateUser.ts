import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1774948202574 implements MigrationInterface {
    name = 'CreateUser1774948202574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "first_name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "last_name" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "pin" character varying(4) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "pin"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "first_name"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying(100) NOT NULL`);
    }

}
