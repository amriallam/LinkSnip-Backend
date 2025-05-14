import { Entity, Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Visit } from "src/visit/entities/visit.entity";

@Entity()
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  longUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Visit, visit => visit.url)
  visits: Visit[];
}