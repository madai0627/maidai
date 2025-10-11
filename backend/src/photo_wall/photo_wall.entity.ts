import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('photo_wall')
export class PhotoWall {
  @PrimaryGeneratedColumn()
  id: number;

  // 图片数据：可存储为base64或外链URL，这里存储base64字符串
  @Column('longtext', { comment: '图片Base64或URL' })
  image: string;

  @Column({ default: '', comment: '图片描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  created_at: Date;
}


