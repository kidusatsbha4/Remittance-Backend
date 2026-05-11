import { MigrationInterface, QueryRunner } from "typeorm";

export class Createkyc1776318094800 implements MigrationInterface {
    name = 'Createkyc1776318094800'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_kyc" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "id_type" character varying NOT NULL, "dob" date NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "country" character varying NOT NULL, "id_photo_path" character varying, "selfie_photo_path" character varying, "verified" boolean NOT NULL DEFAULT false, "verified_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cf68f396a382a4e17f95baef3dd" UNIQUE ("user_id"), CONSTRAINT "REL_cf68f396a382a4e17f95baef3d" UNIQUE ("user_id"), CONSTRAINT "PK_b9376ec277533c8e7931063bfe1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "UQ_25d24010f53bb80b78e412c9656" UNIQUE ("role_id", "permission_id")`);
        await queryRunner.query(`ALTER TABLE "users_kyc" ADD CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_kyc" DROP CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "UQ_25d24010f53bb80b78e412c9656"`);
        await queryRunner.query(`DROP TABLE "users_kyc"`);
    }

}
