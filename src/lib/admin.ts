import { NextRequest } from "next/server";

export function isAdminRequest(request: NextRequest) {
  const expected = process.env.FACHEIRO_ADMIN_TOKEN;
  const provided = request.headers.get("x-admin-token");
  return Boolean(expected && provided && expected === provided);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
