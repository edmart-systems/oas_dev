import { CategoryDtoInput } from "../dtos/category.dto";
import { Product } from "./purchase.types";



export interface Category extends CategoryDtoInput {
  category_id: string;
  created_at: Date;
  updated_at?: Date;
  creator?: {
    co_user_id: string;
    firstName: string;
    lastName: string; 
  };
  Product: Product[];
}