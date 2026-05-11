import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateManual1778053873959 implements MigrationInterface {
    name = 'CreateManual1778053873959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "manuals" ("id" SERIAL NOT NULL, "toAccount" character varying NOT NULL, "toAccountHolder" character varying NOT NULL, "currency" character varying NOT NULL, "toCurrency" character varying NOT NULL, "amount" numeric(18,2) NOT NULL, "bonus" numeric(18,2) NOT NULL, "remark" character varying, "eCurrency" character varying, "exchange_rate" numeric(18,6), "status" character varying NOT NULL DEFAULT 'pending', "channel" character varying, "external_ref" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "sender_id" integer, CONSTRAINT "PK_ff041e52910af133b601ce3c707" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "manuals" ADD CONSTRAINT "FK_69b3503aa007250988d43bc8f77" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manuals" DROP CONSTRAINT "FK_69b3503aa007250988d43bc8f77"`);
        await queryRunner.query(`DROP TABLE "manuals"`);
    }

}
