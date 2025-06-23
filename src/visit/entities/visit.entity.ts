import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Url } from '../../url/entities/url.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Url, url => url.visits)
  @JoinColumn({ name: 'longUrl' })
  url: Url;

  @Column()
  longUrl: string;

  @CreateDateColumn()
  timestamp: Date;
}