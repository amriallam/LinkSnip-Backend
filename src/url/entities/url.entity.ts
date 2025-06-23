import { Entity, Column, CreateDateColumn, OneToMany, PrimaryColumn } from "typeorm";
import { Visit } from "src/visit/entities/visit.entity";

@Entity()
export class Url {
  @PrimaryColumn()
  longUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Visit, visit => visit.url)
  visits: Visit[];
}