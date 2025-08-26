export interface Customer {
  customer_id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}
