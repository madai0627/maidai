import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_info')
export class CatInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  breed: string;

  @Column()
  image: string;

  @Column()
  description: string;

  @Column()
  body_size: string;

  @Column()
  color: string;

  @Column()
  average_life: number;

  @Column()
  breed_id: number;
}
