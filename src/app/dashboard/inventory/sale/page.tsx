import SalesHistoryTable from "@/components/dashboard/inventory/sale/salesHistory/salesHistoryTable";

export const dynamic = "force-dynamic"; // ensure no static caching

async function getSales() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/inventory/sale`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`Failed to load sales: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error(e);
    return [] as any[];
  }
}

export default async function SalesPage() {
  const sales = await getSales();
  return (
    <div className="p-4">
      <SalesHistoryTable sales={sales} />
    </div>
  );
}
