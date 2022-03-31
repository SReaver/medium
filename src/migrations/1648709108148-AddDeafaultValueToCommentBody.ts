import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeafaultValueToCommentBody1648709108148 implements MigrationInterface {
    name = 'AddDeafaultValueToCommentBody1648709108148'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "body" SET DEFAULT ''`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" ALTER COLUMN "body" DROP DEFAULT`);
    }

}
