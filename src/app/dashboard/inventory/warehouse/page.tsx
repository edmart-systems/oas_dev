"use client";

import PageTitle from "@/components/dashboard/common/page-title";
import LocationMain from "@/components/dashboard/common/settings/location/LocationMain";

const WarehousePage = () => {
  return (
    <>
      <PageTitle title="Warehouse & Location Management" />
      <LocationMain />
    </>
  );
};

export default WarehousePage;