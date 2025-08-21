import { TagDtoInput } from "../dtos/tag.dto";
import { Product } from "@/types/product.types";

export interface Tag extends TagDtoInput {
  tag_id: string;
  created_at: Date;
  updated_at?: Date;
  creator?: {
    co_user_id: string;
    firstName: string;
    lastName: string; 
  };
  Product: Product[];
}