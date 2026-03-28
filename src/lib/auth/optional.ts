import type { NextApiRequest } from "next";

import { getAuthenticatedUser } from "./server";

export async function getOptionalAuthenticatedUser(req: NextApiRequest) {
  return getAuthenticatedUser(req);
}
