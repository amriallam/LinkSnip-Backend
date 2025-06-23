import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUrlPrimaryKeyToLongUrl1747209717103 implements MigrationInterface {
    name = 'ChangeUrlPrimaryKeyToLongUrl1747209717103'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint first
        await queryRunner.query(`ALTER TABLE \`visit\` DROP FOREIGN KEY \`FK_cc4b41153cc2ece51a127785082\``);
        
        // Add longUrl column to visit table
        await queryRunner.query(`ALTER TABLE \`visit\` ADD \`longUrl\` varchar(255) NOT NULL`);
        
        // Copy longUrl values from url table to visit table
        await queryRunner.query(`UPDATE \`visit\` v INNER JOIN \`url\` u ON v.urlId = u.id SET v.longUrl = u.longUrl`);
        
        // Drop the old urlId column from visit table
        await queryRunner.query(`ALTER TABLE \`visit\` DROP COLUMN \`urlId\``);
        
        // Drop the id column from url table
        await queryRunner.query(`ALTER TABLE \`url\` DROP COLUMN \`id\``);
        
        // Make longUrl the primary key in url table
        await queryRunner.query(`ALTER TABLE \`url\` ADD PRIMARY KEY (\`longUrl\`)`);
        
        // Add foreign key constraint from visit.longUrl to url.longUrl
        await queryRunner.query(`ALTER TABLE \`visit\` ADD CONSTRAINT \`FK_visit_url_longUrl\` FOREIGN KEY (\`longUrl\`) REFERENCES \`url\`(\`longUrl\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the foreign key constraint
        await queryRunner.query(`ALTER TABLE \`visit\` DROP FOREIGN KEY \`FK_visit_url_longUrl\``);
        
        // Add id column back to url table
        await queryRunner.query(`ALTER TABLE \`url\` ADD \`id\` int NOT NULL AUTO_INCREMENT PRIMARY KEY`);
        
        // Add urlId column back to visit table
        await queryRunner.query(`ALTER TABLE \`visit\` ADD \`urlId\` int NULL`);
        
        // Copy id values from url table to visit table
        await queryRunner.query(`UPDATE \`visit\` v INNER JOIN \`url\` u ON v.longUrl = u.longUrl SET v.urlId = u.id`);
        
        // Drop the longUrl column from visit table
        await queryRunner.query(`ALTER TABLE \`visit\` DROP COLUMN \`longUrl\``);
        
        // Add back the original foreign key constraint
        await queryRunner.query(`ALTER TABLE \`visit\` ADD CONSTRAINT \`FK_cc4b41153cc2ece51a127785082\` FOREIGN KEY (\`urlId\`) REFERENCES \`url\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
} 