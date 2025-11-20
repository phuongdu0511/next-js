/* eslint-disable @typescript-eslint/no-explicit-any */
import dishApiRequests from "@/apiRequests/dish";
import { formatCurrency, wrapServerApi } from "@/lib/utils";
import Image from "next/image";
import DishDetail from "./dish-detail";

export default async function DishPage({ params }: any) {
  const { id } = await params;
  const data = await wrapServerApi(() => dishApiRequests.getDish(Number(id)));

  const dish = data?.payload?.data;
  if (!dish)
    return (
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold">
          Món ăn không tồn tại
        </h1>
      </div>
    );
  return <DishDetail dish={dish} />;
}
