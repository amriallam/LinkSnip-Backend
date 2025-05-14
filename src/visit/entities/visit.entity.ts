import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Url } from '../../url/entities/url.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Url, url => url.visits)
  url: Url;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  timestamp: Date;
}