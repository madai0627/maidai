export class CreateUserDto {
  id: number;
  username: string;
  password: string;
  created_at: Date;
  role: string;
}
