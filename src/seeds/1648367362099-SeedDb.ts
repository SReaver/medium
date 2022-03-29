import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDb1648367362099 implements MigrationInterface {
	name = 'SeedDb1648367362099'

	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`);
		// password is 123
		await queryRunner.query(`INSERT INTO users (username, email, password) VALUES ('foo', 'foo@gmail.com', '$2b$10$2nmNaozjYumzRuXgXMiQseG6mvF1CkhYpyws5uTTKQzG/mD/0ootu')`);
		await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'first article description', 'first article body', 'coffee,dragons', 1)`);
		await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('second-article', 'Second article', 'second article description', 'second article body', 'coffee,dragons', 1)`);
	}

	public async down(): Promise<void> { }

}
