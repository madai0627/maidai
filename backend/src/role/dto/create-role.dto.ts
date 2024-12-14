export class CreateRoleDto {
  id: number;
  role_name: string;
  permissions: string;
  description: string;
  created_at: Date;
}
