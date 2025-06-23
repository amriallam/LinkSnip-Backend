import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIpAddressFromVisit1747209717102 implements MigrationInterface {
    name = 'RemoveIpAddressFromVisit1747209717102'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`visit\` DROP COLUMN \`ipAddress\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`visit\` ADD \`ipAddress\` varchar(255) NOT NULL`);
    }
} 