# MM IT Tech Ltd - MVP (React + PHP + MySQL, XAMPP)

This is a **core MVP foundation** based on `mahi.txt`, built for **XAMPP (Apache + MySQL)** with a **fully responsive frontend** (mobile, tablet and desktop).

## Stack
- **Frontend:** React + Vite, React Router, Tailwind CSS, Framer Motion, Lucide icons, Axios
- **Backend:** Core PHP 8+ REST-style endpoints (PDO, sessions)
- **Database:** MySQL (`mm_it_tech_db`)

## Project Structure
- `frontend/` - React app (public pages, admin console with full content management)
- `backend/` - PHP config, helpers, middleware, APIs
- `database/mm_it_tech.sql` - schema + seed data
- `uploads/` - uploaded blog/service/review images (created automatically)
- `mahi.txt` - original full specification

## 1) Database Setup (XAMPP / phpMyAdmin)
1. Start **Apache** and **MySQL** in XAMPP.
2. Open phpMyAdmin and import:
   - `database/mm_it_tech.sql`
3. This creates `mm_it_tech_db` and the tables (`admins`, `blog_posts`, `contact_submissions`, `services`, `testimonials`, `website_settings`) with seed data.

> If you already have the database from an earlier version, run this to add the new columns:
> ```sql
> ALTER TABLE website_settings
>   ADD COLUMN site_stats TEXT NULL AFTER footer_text,
>   ADD COLUMN whatsapp_number VARCHAR(32) NULL AFTER site_stats;
> ```

## 2) Backend Setup (PHP API on Apache)
1. Place the project under your XAMPP web root so it is accessible as:
   - `http://localhost/mm-it-tech/` (recommended path), or adjust the API base URL accordingly.
   - If your folder name differs, update the frontend API base URL.
2. PHP DB config is in:
   - `backend/config/database.php` (defaults: host `127.0.0.1`, db `mm_it_tech_db`, user `root`, empty password)
3. Ensure Apache serves PHP 8+ and `pdo_mysql` is enabled.

> **Why `127.0.0.1` and not `localhost`?** On Windows/XAMPP, `localhost` makes the MySQL client
> connect over a **named pipe**, which adds roughly **2 seconds to every request**. Using the TCP
> loopback address drops each query to about **25 ms**. Override with the `DB_HOST` env var if needed.

### Implemented API endpoints
**Public**
- `GET  /backend/api/settings/get.php`
- `GET  /backend/api/services/list.php`
- `GET  /backend/api/blogs/list.php`
- `GET  /backend/api/testimonials/list.php`
- `POST /backend/api/contact/submit.php`

**Auth (session required for everything below)**
- `POST /backend/api/auth/login.php`
- `GET  /backend/api/auth/me.php`
- `POST /backend/api/auth/logout.php`
- `POST /backend/api/auth/change-password.php`
- `GET  /backend/api/contact/list.php`
- `POST /backend/api/contact/update-status.php`

**Blog posts**
- `GET  /backend/api/blogs/admin-list.php`
- `POST /backend/api/blogs/create.php`
- `POST /backend/api/blogs/update.php`
- `POST /backend/api/blogs/delete.php`
- `POST /backend/api/blogs/upload-image.php` (multipart)

**Services**
- `GET  /backend/api/services/admin-list.php`
- `POST /backend/api/services/create.php`
- `POST /backend/api/services/update.php`
- `POST /backend/api/services/delete.php`

**Testimonials**
- `GET  /backend/api/testimonials/admin-list.php`
- `POST /backend/api/testimonials/create.php`
- `POST /backend/api/testimonials/update.php`
- `POST /backend/api/testimonials/delete.php`

**Settings**
- `POST /backend/api/settings/update.php`

## 3) Frontend Setup (React + Vite)
1. Open terminal in `frontend/`
2. Install dependencies:
   - `npm install`
3. Configure `frontend/.env`:
   ```
   VITE_API_BASE_URL=/backend/api
   VITE_API_PROXY_TARGET=http://localhost:8000
   ```
   The dev server proxies `/backend` to the PHP API so everything is **same-origin**. That keeps the
   PHP session cookie working whether you open the site on `localhost` or `127.0.0.1`.
4. Run dev server:
   - `npm run dev`
5. Build for production:
   - `npm run build`

> Note: Vite dev server is used for frontend development; PHP APIs run on XAMPP Apache.

## 4) Admin Access
- Admin login page: `/admin/login`
- Dashboard: `/admin/dashboard`
- Enquiries: `/admin/enquiries`
- Blog posts: `/admin/blog`
- Services: `/admin/services`
- Client reviews: `/admin/reviews`
- Website settings: `/admin/settings`
- Change password: `/admin/password`

### Default admin seed
The SQL includes a default admin row (`admin@mmittech.com` / `Admin@123`).

To set a different password, use the **admin panel → Password** page, or update MySQL directly:

```sql
-- generate a hash first
SELECT password_hash('YourNewPassword');
UPDATE admins SET password_hash = '<your_hash_here>' WHERE email = 'admin@mmittech.com';
```

## 5) What the admin can manage
| Module | Capabilities |
|---|---|
| Dashboard | Enquiry/blog/service counts, pipeline breakdown, recent enquiries |
| Enquiries | List, search, filter by status, update status |
| Blog posts | Create/edit/delete, Draft/Published/Scheduled, featured image upload |
| Services | Create/edit/delete, show/hide, ordering, image upload, features & benefits |
| Client reviews | Create/edit/delete, 1-5 star rating, client photo, publish toggle |
| Settings | Company details, contact info, hero copy, footer text, **key numbers used across the site**, WhatsApp number |
| Password | Change the signed-in admin password |

### Key numbers (site-wide)
`website_settings.site_stats` stores JSON that drives every statistic on the site:

```json
{
  "years": "15+", "uptime": "99.9%", "endpoints": "2,400+", "response": "<15m",
  "clients": "250+", "engineers": "40+", "secured": "4,900+",
  "recommend": "98%", "rating": "4.9/5"
}
```

Edit them in **Admin → Settings → Key numbers** and they update on the Home, About and Reviews pages.

### WhatsApp chat
The floating chat button on the Home page lists every published service. Clicking one opens
`wa.me` with a pre-filled message for that service. Set the number in **Admin → Settings →
WhatsApp number** (digits only, with country code, no spaces).

### Image uploads
Uploads are validated server-side (real image check via `getimagesize`, whitelist of
JPG/PNG/WEBP/GIF, 5 MB limit) and stored in `uploads/` with a random filename. Replacing or
deleting a record removes the old file.

## 6) Performance notes
- Public GET endpoints send `Cache-Control` headers.
- The frontend keeps an in-memory stale-while-revalidate cache, so navigating between pages does
  not re-fetch the same data.
- The bundle is split into cached vendor chunks (`react`, `motion`, `icons`).

## 7) Not implemented yet
- Multi-user roles (only the `admin` role exists)
- CSRF tokens and rate limiting
- Media library / bulk upload
- Newsletter and enquiry export (CSV)

## 8) Development helpers
`frontend/scripts/` contains small CDP-based tools used to verify the UI:

```bash
node scripts/shot.mjs <url> <out.png> [width] [height] [full]   # true device-emulated screenshot
node scripts/overflow-check.mjs <url> [width]                   # find horizontal overflow
node scripts/reveal-test.mjs <url> <selector>                   # verify scroll-reveal
node scripts/admin-nav-test.mjs                                 # verify admin navigation
node scripts/whatsapp-test.mjs                                  # verify the chat widget
```
