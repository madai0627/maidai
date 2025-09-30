import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('cat_type')
export class CatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;

  @Column('longtext')
  img_data: string;

  @Column()
  desc: string;

  @Column()
  body_size: string;

  @Column()
  color: string;

  @Column()
  average_life: string;

  @Column()
  origin: string;

  @CreateDateColumn()
  created_at: Date;
}
