import { http, HttpResponse } from "msw";
import { createOrderRecord } from "@/mocks/data/orders-queries";
import type { CreateOrderInput } from "@/types/order";

export const ordersHandlers = [
  http.post("*/orders", async ({ request }) => {
    const input = (await request.json()) as CreateOrderInput;
    const order = createOrderRecord(input);
    return HttpResponse.json(order, { status: 201 });
  }),
];
