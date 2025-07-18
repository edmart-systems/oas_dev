import { PaginationData } from "@/types/other.types";

export const getPaginationData = (
  offset: number,
  limit: number,
  total: number
): PaginationData => {
  var BoL = false;
  var EoL = false;
  if (offset == 0) {
    BoL = true;
  }
  if (offset >= total - limit) {
    EoL = true;
  }
  return {
    total,
    min: offset + 1,
    max: EoL ? total : offset + limit,
    BoL,
    EoL,
  };
};
