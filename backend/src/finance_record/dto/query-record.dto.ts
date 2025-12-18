export class QueryRecordDto {
  userId?: number;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  purpose?: string;
  category?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'amount';
  order?: 'ASC' | 'DESC';
}
