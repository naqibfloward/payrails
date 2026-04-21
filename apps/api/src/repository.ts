import { Currency, SessionPayload, UpdateAmountPayload } from "./schema";
import ky from "ky";
import path from "path";

const PAYRAILS_CUSTOMER = "mohamad.hishamuddin@floward.com";
const PAYRAILS_WORKFLOW_CODE = "payment-acceptance";
const PAYRAILS_CLIENT_ID = "<REPLACE_WITH_ACTUAL_CLIENT_ID>";
const PAYRAILS_CLIENT_SECRET = "<REPLACE_WITH_ACTUAL_CLIENT_SECRET>";
const PAYRAILS_UK_WORKSPACE_ID = "<REPLACE_WITH_ACTUAL_UK_WORKSPACE_ID>";
const PAYRAILS_JORDAN_WORKSPACE_ID =
  "<REPLACE_WITH_ACTUAL_JORDAN_WORKSPACE_ID>";

/**
 * To make requests to Payrails, each request must include the certificates and keys for mutual TLS authentication. In this example, we read them from the local filesystem and attach them to the fetch options, ensuring secure and authenticated communication with the API.
 *
 * @see https://docs.payrails.com/docs/mtls-configuration-1
 */
const root = process.cwd();

const key = await Bun.file(
  path.join(root, "certs/00H4-eC7m.key"),
).arrayBuffer();

const cert = await Bun.file(
  path.join(root, "certs/00H4-eC7m.pem"),
).arrayBuffer();

export const payrailsClient = ky.create({
  prefix: "https://api.staging.payrails.io/",
  headers: {
    accept: "application/json",
  },
  fetch: (input, init) =>
    fetch(input, { ...init, tls: { key, cert } } as RequestInit),
});

/**
 * @see https://docs.payrails.com/reference/getoauthtoken
 */
type AccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export const authenticate = async () => {
  return await payrailsClient
    .post(`auth/token/${PAYRAILS_CLIENT_ID}`, {
      headers: {
        "x-api-key": PAYRAILS_CLIENT_SECRET,
        accept: "application/json",
      },
    })
    .json<AccessTokenResponse>();
};

export const getHeaderWithBearer = async () => {
  const auth = await authenticate();

  return {
    Authorization: `Bearer ${auth.access_token}`,
  };
};

const getWorkspaceId = (currency: Currency) => {
  if (currency === "GBP") return PAYRAILS_UK_WORKSPACE_ID;
  if (currency === "JOD") return PAYRAILS_JORDAN_WORKSPACE_ID;
  throw new Error("Unsupported currency");
};

/**
 * @see https://docs.payrails.com/reference/clientinit
 */
type SessionResponse = {
  version: string;
  data: string;
};

/**
 * Make sure to use the correct workspace ID based on the country, as each workspace has its own set of workflows that determine which payment methods are shown and how payments are processed.
 */
export const getSession = async (params: SessionPayload) => {
  const header = await getHeaderWithBearer();

  const payload = {
    type: "dropIn",
    amount: {
      value: params.amount,
      currency: params.currency,
    },
    workflowCode: PAYRAILS_WORKFLOW_CODE,
    merchantReference: `ORDER_ID_${Bun.randomUUIDv7()}`,
    holderReference: PAYRAILS_CUSTOMER,
    workspaceId: getWorkspaceId(params.currency),
    meta: {
      risk: { allowNative3DS: true, threeDSMode: "Force" },
      ...(params.recurring && {
        subscription: {
          chargeFrequency: `P${params.months}M`,
          expiration: "2026-12-12",
        },
      }),
    },
  };

  /**
   * For simplicity and demonstration, we use random idempotency keys for each session. In a real-world scenario, these keys should be generated and managed carefully to prevent duplicate transactions during retries or network issues.
   */
  return await payrailsClient
    .post("merchant/client/init", {
      headers: {
        ...header,
        "x-idempotency-key": Bun.randomUUIDv7(),
      },
      json: payload,
    })
    .json<SessionResponse>()
    .catch(async (error) => {
      const message =
        error?.response instanceof Response
          ? await error.response.text().catch(() => String(error))
          : String(error);
      console.error("Error fetching session:", message);
      throw error;
    });
};

/**
 * @see https://docs.payrails.com/reference/lookupaction
 */

export const updateAmount = async (body: UpdateAmountPayload) => {
  const header = await getHeaderWithBearer();
  const url = `merchant/workflows/${PAYRAILS_WORKFLOW_CODE}/executions/${body.executionId}/lookup`;

  const payload = {
    amount: {
      value: body.amount,
      currency: body.currency,
    },
  };

  return await payrailsClient
    .post(url, {
      headers: {
        ...header,
        "x-idempotency-key": Bun.randomUUIDv7(),
      },
      json: payload,
    })
    .json<SessionResponse>()
    .catch(async (error) => {
      const message =
        error?.response instanceof Response
          ? await error.response.text().catch(() => String(error))
          : String(error);
      console.error("Error for lookup:", message);
      throw error;
    });
};
