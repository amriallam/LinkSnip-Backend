import { MigrationInterface, QueryRunner } from "typeorm";

export class DBInit1747209717101 implements MigrationInterface {
    name = 'DBInit1747209717101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`visit\` (\`id\` int NOT NULL AUTO_INCREMENT, \`ipAddress\` varchar(255) NOT NULL, \`timestamp\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`urlId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`url\` (\`id\` int NOT NULL AUTO_INCREMENT, \`longUrl\` varchar(255) NOT NULL, \`shortCode\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_df4aaf7b2c247152f3e92fe7c7\` (\`shortCode\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`visit\` ADD CONSTRAINT \`FK_cc4b41153cc2ece51a127785082\` FOREIGN KEY (\`urlId\`) REFERENCES \`url\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`visit\` DROP FOREIGN KEY \`FK_cc4b41153cc2ece51a127785082\``);
        await queryRunner.query(`DROP INDEX \`IDX_df4aaf7b2c247152f3e92fe7c7\` ON \`url\``);
        await queryRunner.query(`DROP TABLE \`url\``);
        await queryRunner.query(`DROP TABLE \`visit\``);
    }

}
