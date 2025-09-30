import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_info')
export class CatInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('longtext')
  img_data: string;

  @Column()
  age: string;

  @Column()
  type: string;

  @Column()
  type_id: number;

  @Column()
  color: string;

  @Column()
  weight: number;

  @Column()
  desc: string;

  @Column()
  bithday: Date;
}
