import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_type')
export class CatType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type_name: string;

  @Column()
  img_url: string;

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

  @Column()
  created_at: Date;
}
