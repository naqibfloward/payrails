import { authenticate, getSession, updateAmount } from "./repository";
import { SessionPayload, UpdateAmountPayload } from "./schema";

export const authenticateUser = async () => {
  return authenticate();
};

export const getSDKSession = async (params: SessionPayload) => {
  return getSession(params);
};

export const updateOrderAmount = (body: UpdateAmountPayload) => {
  return updateAmount(body);
};
