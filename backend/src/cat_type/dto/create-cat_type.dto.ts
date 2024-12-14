export class CreateCatTypeDto {
  type_name: string;
  img_url?: string;
  desc: string;
  body_size: string;
  color: string;
  average_life: number;
  origin: string;
  created_at: Date
}
