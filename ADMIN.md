# ZIPO administration

The owner signs in with email and password at `admin.html`. Products, categories and homepage settings are saved in Supabase. Customer inquiries go to WhatsApp; no customer accounts or checkout are introduced.

## Connection and deployment

Copy `.env.example` to `.env.local` and supply the project URL and **publishable** key. These are public connection settings, not administrator credentials. Never put a service-role key, database password or account password in a `VITE_` variable or this repository.

The GitHub Pages workflow reads the same two settings from repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The admin is a separate Vite entry point, so its Supabase authentication SDK is not downloaded by storefront visitors.

The migration in `supabase/migrations/202611210001_catalog.sql` creates the catalog, single homepage-settings row, administrator allowlist, storage bucket and access policies. The second migration enforces a photo for published products and removes deleted products from the moving collection. Both have been applied to the ZIPO project through the SQL editor. Do not reapply them to an existing database. `supabase/seed.sql` imports the nine initial products, their temporary euro prices and five categories. It is for initial setup only; rerunning its settings statement would replace the owner's homepage selections. `node scripts/generate-seed.mjs` regenerates it from the original demo records.

## Admin access

Public signups and anonymous sign-ins are disabled. Create users through Supabase Authentication → Users → Add user → Create new user. The owner enters the password privately. Auto-confirm is appropriate for these manually provisioned accounts.

`private.admin_allowlist` holds the approved, lowercase email addresses. `public.is_shop_admin()` checks the authenticated user's ID against the actual confirmed `auth.users` record and the private allowlist. Client-supplied metadata does not grant a role. Only a database administrator can modify the allowlist. The initial approved email is `ziposhop@gmail.com`.

All three catalog tables use row-level security. Public requests can read active categories and published products in active categories. Only allowlisted administrators can change records or upload/delete media. The browser's session check is for the interface; database policies enforce access independently.

Product media is public so shoppers can view it. Draft photos also have public, unpredictable storage URLs; do not upload confidential documents to this bucket. Account records and the admin allowlist are not publicly readable.

## Owner workflow

- **Produktet:** add/edit names, descriptions, euro prices, availability, publication, up to six photos and 20 specification rows. Save a draft with “Shfaq në dyqan” off. Publishing requires a photo.
- **Kategoritë:** add/edit the name, description, order, active state and up to four images. Existing category identifiers remain stable, keeping links intact. A category with products cannot be deleted until its products are moved or removed.
- **Ballina:** choose the featured product and up to 12 products for the moving collection. These controls only offer published products in active categories. Selecting no featured product or no collection products hides that section.

All nine initial live prices were set through the signed-in admin and verified through the public catalog. They are temporary amounts for the owner to replace. `202611210003_initial_prices.sql` documents the equivalent initialization and preserves any non-null price; its row updates were applied through the admin rather than the SQL migration runner. The regenerated seed includes these prices for new installations.

After a save, the editor waits for a refreshed catalog before returning to the list, preventing rows from moving during selection. An unchanged homepage selection can also be saved again.

All editors warn before leaving unsaved changes through section navigation, cancellation, sign-out, the brand link or closing/reloading the page.

Uploads occur on Save. The browser makes a main image (up to 1600 pixels) and thumbnail (up to 640 pixels), preserving transparency where supported. JPEG, PNG and WebP input files up to 10 MB are accepted; the storage bucket caps each processed file at 3 MB. Uploads from a failed save are removed. Previously saved images are retained when a record is deleted; unused media can be cleaned up later from Storage.

The storefront fetches published metadata through the public API and renders 24 products per category page. It refreshes data when revisited after a minute. New categories receive a generic image composition. Existing hero imagery remains part of the storefront design; links fall back to categories when their featured product is removed.

Password recovery is implemented through Supabase Auth but its request button is hidden by default. Delivery to addresses outside the Supabase organization requires configuring production SMTP. After SMTP is ready, set `VITE_PASSWORD_RECOVERY_ENABLED=true` at build time to expose the button. Until then, manage account recovery through the project dashboard. Never share passwords in chat.

## Verification

`npm test` builds in test mode and runs the storefront and admin browser tests against intercepted API fixtures. Tests never sign into or modify the owner's production catalog. Admin coverage includes rejected logins, authorization checks, logout, photo processing/uploads, save errors, CRUD, categories, homepage selections and a 200-product list.

Separate live checks verify the production schema, read access and rejected anonymous writes. A signed-in browser check is required to verify the owner's real login and end-to-end production writes; mocked tests alone do not establish database security.
