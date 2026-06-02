import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateALL1779705086778 implements MigrationInterface {
    name = 'CreateALL1779705086778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "permissions" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "codename" character varying NOT NULL, "content_type" character varying NOT NULL, CONSTRAINT "UQ_5b454affb9ac96f7a2f171e5a42" UNIQUE ("codename"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("id" SERIAL NOT NULL, "role_id" integer, "permission_id" integer, CONSTRAINT "UQ_25d24010f53bb80b78e412c9656" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("id" SERIAL NOT NULL, "user_id" integer, "role_id" integer, CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users_kyc" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "id_type" character varying NOT NULL, "dob" date NOT NULL, "address" character varying NOT NULL, "city" character varying NOT NULL, "country" character varying NOT NULL, "id_photo_path" character varying, "selfie_photo_path" character varying, "verified" boolean NOT NULL DEFAULT false, "verified_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cf68f396a382a4e17f95baef3dd" UNIQUE ("user_id"), CONSTRAINT "REL_cf68f396a382a4e17f95baef3d" UNIQUE ("user_id"), CONSTRAINT "PK_b9376ec277533c8e7931063bfe1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "manuals" ("id" SERIAL NOT NULL, "toAccount" character varying NOT NULL, "toAccountHolder" character varying NOT NULL, "currency" character varying NOT NULL, "toCurrency" character varying NOT NULL, "amount" numeric(18,2) NOT NULL, "bonus" numeric(18,2) NOT NULL, "remark" character varying, "eCurrency" character varying, "exchange_rate" numeric(18,6), "status" character varying NOT NULL DEFAULT 'pending', "channel" character varying, "external_ref" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sender_id" integer, CONSTRAINT "PK_ff041e52910af133b601ce3c707" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "first_name" character varying(50) NOT NULL, "last_name" character varying(50) NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "pin" text NOT NULL, "otp" text, "otp_expires" TIMESTAMP, "otp_verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "merchant_keys" ("id" SERIAL NOT NULL, "merchant_id" character varying NOT NULL, "merchant_name" character varying NOT NULL, "secret_key" character varying NOT NULL, "access_key" character varying NOT NULL, "status" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3cf878aab708be4274bde63e2a2" UNIQUE ("secret_key"), CONSTRAINT "UQ_fcb82dc4425796e16710f4b73a2" UNIQUE ("access_key"), CONSTRAINT "PK_765c845856501d9bc899586f38d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "transaction_ref" character varying NOT NULL, "sender_id" integer NOT NULL, "beneficiary_acc" character varying NOT NULL, "amount" numeric(18,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'ETB', "exchange_rate" numeric(18,6), "status" character varying NOT NULL DEFAULT 'PENDING', "channel" character varying, "external_ref" character varying, "failure_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, CONSTRAINT "UQ_04f63f853869f515665c84b9bb2" UNIQUE ("transaction_ref"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bonus" ("id" SERIAL NOT NULL, "description" character varying(255) NOT NULL, "amount" numeric(15,2) NOT NULL, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_885c9ca672f42874b1a5cb4d9e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."transfer_type_transfer_type_enum" AS ENUM('AUTOMATIC', 'MANUAL')`);
        await queryRunner.query(`CREATE TABLE "transfer_type" ("id" SERIAL NOT NULL, "transfer_type" "public"."transfer_type_transfer_type_enum" NOT NULL, "description" text, "status" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_e8079532c19bb535c33902388f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_kyc" ADD CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "manuals" ADD CONSTRAINT "FK_69b3503aa007250988d43bc8f77" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0"`);
        await queryRunner.query(`ALTER TABLE "manuals" DROP CONSTRAINT "FK_69b3503aa007250988d43bc8f77"`);
        await queryRunner.query(`ALTER TABLE "users_kyc" DROP CONSTRAINT "FK_cf68f396a382a4e17f95baef3dd"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`DROP TABLE "transfer_type"`);
        await queryRunner.query(`DROP TYPE "public"."transfer_type_transfer_type_enum"`);
        await queryRunner.query(`DROP TABLE "bonus"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
        await queryRunner.query(`DROP TABLE "merchant_keys"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "manuals"`);
        await queryRunner.query(`DROP TABLE "users_kyc"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
    }

}
