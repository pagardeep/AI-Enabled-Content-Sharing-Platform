 – AI-Enabled Content Sharing Platform (Backend)
 · Node.js · Express · MongoDB (Mongoose) · JWT · Google Gemini

## Setup
```bash
npm install
cp .env.example .env     # fill in MONGO_URI, JWT_SECRET, GEMINI_API_KEY, ADMIN_SECRET
npm run dev              # or: npm start
```
Requires Node 18+ and a running MongoDB (local or Atlas).

If MongoDB Atlas SRV lookups fail because of your machine's DNS resolver, optionally
add `DNS_SERVERS=1.1.1.1,8.8.8.8` to `.env` to use those DNS resolvers for MongoDB
connection setup. Otherwise, the system-configured DNS resolvers are used.

## Folder structure
```
server.js
src/
  app.js              express app + routes
  config/db.js        mongoose connection
  models/             User, Post
  middleware/         auth (JWT + admin), error, validateId, upload
  controllers/        auth, post, admin, ai
  routes/             auth, posts, admin, ai
  services/gemini.js  Gemini integration
```

## Schemas
- **User**: `{ name, email, password, role: "admin" | "user" }`
- **Post**: `{ title, description, content, image, category, createdBy (ref User), status: "draft" | "pending" | "approved" | "rejected", createdAt }`

## APIs
Send the JWT as `Authorization: Bearer <token>` on protected routes.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Register (admin only with correct `adminSecret`) |
| POST | /auth/login | public | Login, returns JWT |
| GET | /auth/me | user | Logged-in user's details |
| POST | /posts | user | Create post/draft (`status`: draft or pending) |
| GET | /posts | public | All approved posts (`?category=` optional) |
| GET | /posts/my-posts | user | Your own posts and drafts |
| GET | /posts/:id | public | Approved post by ID |
| PATCH | /posts/:id | owner | Update own post |
| DELETE | /posts/:id | owner | Delete own post |
| GET | /admin/posts/pending | admin | Posts awaiting approval |
| PATCH | /admin/posts/approve/:id | admin | Approve pending post |
| PATCH | /admin/posts/reject/:id | admin | Reject pending post |
| POST | /ai/improve/:postId | owner | Improve with Gemini, saved as a new draft (new ID); original preserved |

### Example requests
```bash
# Register a normal user
curl -X POST localhost:5000/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Deep","email":"deep@example.com","password":"secret123"}'

# Register an admin
curl -X POST localhost:5000/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"secret123","role":"admin","adminSecret":"<ADMIN_SECRET>"}'

# Login
curl -X POST localhost:5000/auth/login -H "Content-Type: application/json" \
  -d '{"email":"deep@example.com","password":"secret123"}'

# Create a draft
curl -X POST localhost:5000/posts -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"My first post","description":"Intro","content":"hello wrld, this is my fisrt post","category":"tech","status":"draft"}'

# Submit for approval
curl -X PATCH localhost:5000/posts/$ID -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"pending"}'

# AI improve (optionally attach a PDF/TXT reference with -F "file=@notes.pdf")
curl -X POST localhost:5000/ai/improve/$ID -H "Authorization: Bearer $TOKEN"
```

## Behaviour notes
- Users can only set `draft` or `pending`; `approved`/`rejected` are set by admins only.
- Editing an approved/rejected post (without an explicit status) moves it back to `pending`.
- Admins can only approve/reject posts that are `pending`.
- The AI endpoint never modifies the original; it creates a new draft owned by the same user.
- Gemini generation retries up to three times for temporary service and rate-limit errors.
- Gemini document processing: an optional PDF/TXT upload (`file` field, max 10 MB) is sent inline as reference.
