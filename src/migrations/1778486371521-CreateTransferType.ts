import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransferType1778486371521 implements MigrationInterface {
    name = 'CreateTransferType1778486371521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transfer_type_transfer_type_enum" AS ENUM('AUTOMATIC', 'MANUAL')`);
        await queryRunner.query(`CREATE TABLE "transfer_type" ("id" SERIAL NOT NULL, "transfer_type" "public"."transfer_type_transfer_type_enum" NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e8079532c19bb535c33902388f1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "transfer_type"`);
        await queryRunner.query(`DROP TYPE "public"."transfer_type_transfer_type_enum"`);
    }

}
