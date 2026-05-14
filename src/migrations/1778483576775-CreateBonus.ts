import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBonus1778483576775 implements MigrationInterface {
    name = 'CreateBonus1778483576775'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bonus" ("id" SERIAL NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(15,2) NOT NULL, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_885c9ca672f42874b1a5cb4d9e7" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bonus"`);
    }

}
