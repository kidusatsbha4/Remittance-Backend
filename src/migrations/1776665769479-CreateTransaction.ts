import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTransaction1776665769479 implements MigrationInterface {
    name = 'CreateTransaction1776665769479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "transaction_ref" character varying NOT NULL, "sender_id" integer NOT NULL, "beneficiary_acc" character varying NOT NULL, "amount" numeric(18,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'ETB', "exchange_rate" numeric(18,6), "status" character varying NOT NULL DEFAULT 'PENDING', "channel" character varying, "external_ref" character varying, "failure_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, CONSTRAINT "UQ_04f63f853869f515665c84b9bb2" UNIQUE ("transaction_ref"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_5007c936fb75048f7697ecb7eb0"`);
        await queryRunner.query(`DROP TABLE "transactions"`);
    }

}
