import { fixtureCatalog } from "./fixtures";

export async function adminBackend(
  page,
  { denied = false, slow = false } = {},
) {
  const catalog = fixtureCatalog();
  const id = "11111111-1111-4111-8111-111111111111";
  const token = [
    btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
    btoa(
      JSON.stringify({
        sub: id,
        aud: "authenticated",
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ),
    "test-signature",
  ].join(".");
  const user = {
    id,
    aud: "authenticated",
    role: "authenticated",
    email: "ziposhop@gmail.com",
    email_confirmed_at: "2026-11-21T00:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
  };
  const state = { catalog, uploads: [], writes: 0, failedSave: false };
  await page.route("https://zipo-test.supabase.co/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    const authenticated = request.headers().authorization === "Bearer " + token;
    const json = (value, status = 200) =>
      route.fulfill({ status, json: value });
    if (path === "/auth/v1/token") {
      const body = request.postDataJSON();
      return body.password === "test-password-only" && body.email === user.email
        ? json({
            access_token: token,
            token_type: "bearer",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: "test-refresh",
            user,
          })
        : json(
            {
              error: "invalid_grant",
              error_code: "invalid_credentials",
              msg: "Invalid login credentials",
            },
            400,
          );
    }
    if (path === "/auth/v1/logout")
      return route.fulfill({ status: 204, body: "" });
    if (path === "/auth/v1/user") return json(user);
    if (path === "/rest/v1/rpc/is_shop_admin") {
      if (slow) await new Promise((resolve) => setTimeout(resolve, 550));
      return json(authenticated && !denied);
    }
    if (path.startsWith("/storage/v1/object/public/"))
      return route.fulfill({
        path: "public/assets/phone-air-blue.webp",
        contentType: "image/webp",
      });
    if (path.startsWith("/storage/v1/object/product-media/")) {
      if (!authenticated || denied) return json({ message: "Denied" }, 403);
      state.uploads.push(path);
      return json({ Key: path, Id: crypto.randomUUID() });
    }
    const table = path.split("/").at(-1);
    const key = table === "homepage_settings" ? "settings" : table;
    if (!(key in catalog)) return json({ message: "Unauthorized" }, 401);
    const object = request.headers().accept?.includes("vnd.pgrst.object");
    const rows =
      table === "homepage_settings" ? [catalog.settings] : catalog[key];
    if (request.method() === "GET") {
      const data =
        table === "products" && !authenticated
          ? rows.filter((row) => row.published)
          : rows;
      return json(object ? data[0] : data);
    }
    if (!authenticated || denied)
      return json({ code: "42501", message: "Denied" }, 403);
    if (state.failedSave) {
      state.failedSave = false;
      return json({ message: "Temporary failure" }, 500);
    }
    state.writes++;
    const recordId = url.searchParams.get("id")?.replace("eq.", "");
    if (request.method() === "DELETE") {
      const index = rows.findIndex((row) => row.id === recordId);
      const removed = rows.splice(index, 1);
      return json(removed.map((row) => ({ id: row.id })));
    }
    const body = request.postDataJSON();
    if (request.method() === "POST") {
      rows.push({ ...body });
      return json(object ? body : [body]);
    }
    const row = rows.find((row) => String(row.id) === recordId);
    Object.assign(row, body);
    return json(object ? row : [row]);
  });
  return state;
}

export async function login(page) {
  await page.goto("/admin.html");
  await page.getByLabel("Email", { exact: true }).fill("ziposhop@gmail.com");
  await page
    .getByLabel("Password", { exact: true })
    .fill("test-password-only");
  await page.getByRole("button", { name: "Login", exact: true }).click();
}
