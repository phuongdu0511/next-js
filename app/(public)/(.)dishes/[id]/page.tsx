/* eslint-disable @typescript-eslint/no-explicit-any */
import dishApiRequests from "@/apiRequests/dish";
import { wrapServerApi } from "@/lib/utils";
import Modal from "./modal";
import DishDetail from "../../dishes/[id]/dish-detail";

export default async function DishPage({ params }: any) {
  const { id } = await params;
  const data = await wrapServerApi(() => dishApiRequests.getDish(Number(id)));

  const dish = data?.payload?.data;
  return (
    <Modal>
      <DishDetail dish={dish} />
    </Modal>
  );
}
