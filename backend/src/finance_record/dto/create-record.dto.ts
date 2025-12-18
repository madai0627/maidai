export class CreateRecordDto {
  userId: number;
  amount: number;
  category: string;
  purpose: string;
  remark?: string;
  created_at?: Date;
}
