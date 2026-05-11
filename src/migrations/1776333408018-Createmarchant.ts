import { MigrationInterface, QueryRunner } from "typeorm";

export class Createmarchant1776333408018 implements MigrationInterface {
    name = 'Createmarchant1776333408018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merchant_keys" ("id" SERIAL NOT NULL, "merchant_id" character varying NOT NULL, "merchant_name" character varying NOT NULL, "secret_key" character varying NOT NULL, "access_key" character varying NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3cf878aab708be4274bde63e2a2" UNIQUE ("secret_key"), CONSTRAINT "UQ_fcb82dc4425796e16710f4b73a2" UNIQUE ("access_key"), CONSTRAINT "PK_765c845856501d9bc899586f38d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "merchant_keys"`);
    }

}
