import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { getSDKSession, updateOrderAmount } from "./service";
import { sessionPayloadSchema, updateAmountPayloadSchema } from "./schema";

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .get("/session", ({ query }) => getSDKSession(query), {
    query: sessionPayloadSchema,
    detail: {
      summary: "Get SDK session",
      description:
        "Get a new SDK session for the given currency, amount, and payment type.",
    },
  })
  .post("/update", ({ body }) => updateOrderAmount(body), {
    body: updateAmountPayloadSchema,
  })
  .listen(3001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type ApiTypes = typeof app;
