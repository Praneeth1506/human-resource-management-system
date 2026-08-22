# Dayflow HRMS — API Contracts

Generated from the actual current route/schema code (not from memory or commit messages) — every shape and status code below was either read directly from `backend/routes/*.py` + `backend/schemas/*.py`, or verified by actually serializing the Pydantic models. If backend code changes after this doc is written, the code is the source of truth, not this file.

## Base URL & auth

- All routes below are mounted with **no path prefix** beyond what's shown (e.g. `POST /login`, not `/api/login`).
- Auth: `Authorization: Bearer <token>` header. Get a token from `POST /login`.
- Swagger's "Authorize" button now takes a raw pasted token directly (plain `HTTPBearer` scheme, not an OAuth2 form).
- **First-login gate:** every account (including the bootstrap admin) starts with `must_reset_password: true` on login. A token from a `must_reset_password: true` login works for **exactly one endpoint** — `POST /first-login/reset-password` — and gets `403 {"detail": "Password reset required before accessing this resource"}` on every other route until that's done. Don't build a "logged in" state off a successful `/login` call alone — check `must_reset_password` in the response and force the reset flow first if it's `true`.
- Roles: `admin` and `employee` only. No `hr` role exists.

## Conventions that will bite you if you assume otherwise

- **`Decimal` fields serialize as JSON strings, not numbers.** e.g. `"basic": "30000.00"`, not `"basic": 30000.00`. This applies to every payroll money field (`basic`, `hra`, `pf`, `professional_tax`, `gross`, `deductions`, `net_pay`). Parse with `parseFloat()`/`Number()` on the frontend — don't assume they arrive as JS numbers. Verified directly: `PayrollOut(...).model_dump_json()` → `{"basic":"30000.00", ...}`.
- **`date` fields** serialize as `"YYYY-MM-DD"`, **`time`** as `"HH:MM:SS"`, **`datetime`** as `"YYYY-MM-DDTHH:MM:SS"` (naive, no timezone suffix).
- Unset optional fields serialize as JSON `null`, not omitted from the response.
- Generic auth failures are intentionally vague: `401 {"detail": "Invalid email or password"}` never reveals which one was wrong.
- List endpoints that filter (e.g. `GET /payroll?employee_id=`, `GET /attendance/me`) return `200` with `[]` when nothing matches — they do **not** `404` on an empty result set. Only single-record lookups (`GET /payroll/me`, `GET /employees/{id}`, etc.) `404`.
- `PUT` endpoints here are **partial updates** — only send the fields you want changed. Fields you omit are left untouched (Pydantic `exclude_unset`), this isn't strict REST full-replacement PUT.

---

## Auth

### `POST /login`
No auth required.

Request:
```json
{ "email": "string", "password": "string" }
```
Response `200`:
```json
{ "access_token": "string", "token_type": "bearer", "must_reset_password": true }
```
`401` — wrong email or password (same generic message either way).

Email lookup is case-insensitive and whitespace-trimmed server-side (`Test@X.com` and `test@x.com` are the same account).

### `POST /first-login/reset-password`
Auth: Bearer token (this is the one endpoint reachable even by a `must_reset_password: true` token).

Request:
```json
{ "old_password": "string", "new_password": "string" }
```
Response `200`: `{ "detail": "Password updated successfully" }`
`401` — `old_password` incorrect.

### `POST /admin/employees`
Auth: admin only.

Creates a login (`User` + `Employee` row) for a new employee — generates `login_id` and a temp password server-side.

Request:
```json
{
  "first_name": "string",
  "last_name": "string",
  "department": "string | null",
  "designation": "string | null",
  "joining_date": "YYYY-MM-DD",
  "email": "string",
  "phone": "string | null",
  "address": "string | null",
  "profile_picture": "string | null"
}
```
Response `201`:
```json
{ "employee_id": 1, "login_id": "DF-JODO-2026-0001", "temp_password": "string", "role": "employee" }
```
`409` — email already in use. `422` — validation failure. `403` — not admin.

`temp_password` is returned **once**, here, in plaintext — it's not retrievable again. Whoever's building the admin UI needs to display/copy it immediately.

---

## Employees

### `GET /employees`
Auth: admin only. Query: `skip` (default `0`), `limit` (default `50`, max `200`).

Response `200`: array of `EmployeeOut` (shape below).

### `GET /employees/me`
Auth: any authenticated (non-must-reset) user.

Response `200`: own `EmployeeOut`.

### `GET /employees/{employee_id}`
Auth: admin can view any; employee can only view their own (`403` otherwise). `404` if `employee_id` doesn't exist.

**`EmployeeOut` shape:**
```json
{
  "id": 1,
  "login_id": "DF-JODO-2026-0001",
  "role": "employee",
  "employee_code": "DF-JODO-2026-0001",
  "first_name": "string",
  "last_name": "string",
  "department": "string | null",
  "designation": "string | null",
  "joining_date": "YYYY-MM-DD | null",
  "email": "string",
  "phone": "string | null",
  "address": "string | null",
  "profile_picture": "string | null"
}
```

### `PUT /employees/{employee_id}`
Auth: admin can edit any field on any employee. An employee can only edit their **own** record, and only `phone`, `address`, `profile_picture` — any other field in the body gets a `403` naming exactly which field(s) aren't allowed (not silently dropped).

Request (all optional, partial update):
```json
{
  "first_name": "string", "last_name": "string",
  "department": "string", "designation": "string",
  "email": "string", "phone": "string",
  "address": "string", "profile_picture": "string"
}
```
Response `200`: updated `EmployeeOut`.
`403` — not self/admin, or a disallowed field for a self-edit. `404` — not found. `409` — email conflict (admin-only concern; employees can't edit email at all).

---

## Attendance

**`AttendanceOut` shape:**
```json
{
  "id": 1, "employee_id": 1, "date": "YYYY-MM-DD",
  "check_in": "HH:MM:SS | null", "check_out": "HH:MM:SS | null",
  "status": "present | absent | half_day | leave | late | null"
}
```

### `POST /attendance/check-in`
Auth: any authenticated (non-must-reset) user. No body — always today's date, for the caller's own employee record (never a client-supplied `employee_id`).

Response `201`: `AttendanceOut` with `status: "present"` (the only status ever auto-set). `409` — already checked in today.

### `POST /attendance/check-out`
Same auth. No body.

Response `200`: updated `AttendanceOut`. `400` — no check-in today. `409` — already checked out today.

### `GET /attendance/me`
Same auth. Query params:
- `view`: `"daily" | "weekly"` (default `"weekly"` = last 7 days incl. today) — **ignored if `month` is set**
- `month`: `1`-`12` — switches to a calendar-month window instead of `view`
- `year`: only relevant with `month`; defaults to the current year if omitted
- `status`: filter by one of `present|absent|half_day|leave|late`

Response `200`: array of `AttendanceOut`.

### `GET /attendance`
Auth: admin only. Query: `employee_id` (optional), `date` (optional, `YYYY-MM-DD`).

Response `200`: array of `AttendanceOut`, newest date first.

### `PUT /attendance/{employee_id}/status`
Auth: admin only. Manual override/upsert — creates the row if none exists for that employee+date, updates in place if one does (never duplicates).

Request:
```json
{ "date": "YYYY-MM-DD", "status": "present | absent | half_day | leave | late" }
```
Response: `201` if a new row was created, `200` if an existing one was updated — same `AttendanceOut` body either way. `404` — employee not found.

---

## Leave

**`LeaveOut` shape:**
```json
{
  "id": 1, "employee_id": 1, "leave_type": "paid | sick | unpaid",
  "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD",
  "remarks": "string | null", "attachment_url": "string | null",
  "status": "pending | approved | rejected",
  "review_comment": "string | null",
  "created_at": "YYYY-MM-DDTHH:MM:SS | null"
}
```

### `POST /leave`
Auth: any authenticated (non-must-reset) user, for their own employee record.

Request:
```json
{ "leave_type": "paid | sick | unpaid", "start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD", "remarks": "string | null" }
```
Response `201`: `LeaveOut` with `status: "pending"`.
`422` — `end_date` before `start_date`. `409` — overlaps an existing **pending or approved** request of the same employee (inclusive on both ends — sharing even one day counts; a **rejected** request never blocks a reapply for the same dates).

### `GET /leave/me`
Same auth. Response `200`: own requests, `created_at` **descending** (most recent first).

### `GET /leave`
Auth: admin only. Query: `status` (`pending|approved|rejected`), `employee_id` — both optional, independently applied.

Response `200`: array of `LeaveOut`, `created_at` descending.

### `PUT /leave/{leave_id}/approve`
Auth: admin only.

Request: `{ "comment": "string | null" }`
Response `200`: `LeaveOut` with `status: "approved"`, `review_comment` set if a comment was sent.
`409` — request isn't currently `pending` (blocks re-approving or approving a rejected request). `404` — not found.

**Side effect:** sets `attendance.status = "leave"` for **every date** in `[start_date, end_date]` for that employee — creates the attendance row if none exists for a given day, updates it in place if one does. This happens in the same transaction as the status change.

### `PUT /leave/{leave_id}/reject`
Auth: admin only. Same request/response/`409` shape as approve, `status: "rejected"`. **Does not touch attendance at all.**

---

## Payroll

**`PayrollOut` shape** (remember: the `Decimal` fields below are JSON **strings**):
```json
{
  "id": 1, "employee_id": 1, "month": 8, "year": 2026,
  "basic": "30000.00 | null", "hra": "10000.00 | null",
  "pf": "1800.00 | null", "professional_tax": "200.00 | null",
  "working_days": 26, "payable_days": 23,
  "gross": "40000.00 | null", "deductions": "6615.38 | null", "net_pay": "33384.62 | null"
}
```

`payable_days`/`gross`/`deductions`/`net_pay` are **live-recomputed on every read** from current attendance/leave data — never trust these as static values that only change when someone calls the update endpoint. Formula: `payable_days = working_days − unpaid_leave_days − unexcused_absences` (floored at 0); `gross = basic + hra`; `deductions = pf + professional_tax + (per_day_rate × unpaid_days)`; `net_pay = gross − deductions`.

### `GET /payroll/me`
Auth: any authenticated (non-must-reset) employee. Query: `month` and `year` — **both required**.

Response `200`: `PayrollOut`. `404` — no record for that period. `422` — `month`/`year` out of range.

### `GET /payroll/me/history`
Same auth, no query params. Response `200`: array of `PayrollOut`, newest period first (`year desc, month desc`).

### `GET /payroll`
Auth: admin only. Query: `employee_id`, `month`, `year` — **all optional**, independently applied, no requirement to pair `month`+`year`.

Response `200`: array of `PayrollOut`, newest period first.

**There is no `GET /payroll/{employee_id}/latest` and none is planned** — get "latest" by calling `GET /payroll?employee_id={id}` and taking `results[0]` (already sorted newest-first). Remember this returns `[]`, not `404`, if the employee has no payroll yet — check `results.length` before indexing.

### `POST /admin/payroll`
Auth: admin only.

Request:
```json
{
  "employee_id": 1, "month": 8, "year": 2026,
  "basic": 30000.00, "hra": 10000.00, "pf": 1800.00,
  "professional_tax": 200.00, "working_days": 26
}
```
(all fields required; the five numeric fields must be `>= 0`)

Response `201`: `PayrollOut` (live-recomputed, same as any other payroll read).
`404` — `employee_id` doesn't exist. `409` — a record already exists for that employee+month+year. `422` — validation (negative numbers, month/year out of range, etc.).

### `PUT /admin/payroll/{payroll_id}`
Auth: admin only. Partial update of `basic`/`hra`/`pf`/`professional_tax`/`working_days` only — `employee_id`/`month`/`year` aren't editable here (identity fields).

Request: any subset of
```json
{ "basic": 35000.00, "hra": 10000.00, "pf": 1800.00, "professional_tax": 200.00, "working_days": 26 }
```
Response `200`: updated `PayrollOut` (live-recomputed). `404` — not found.

---

## Not currently reachable

`backend/routes/dashboard.py` defines `GET /dashboard/employee/{employee_id}` and `GET /dashboard/admin`, but **this router is never registered** — it's not in `routes/__init__.py`'s `api_router`, so these two paths 404 on the running app regardless of what the file looks like. If Frontend needs dashboard data, it isn't available from the API yet — flag it rather than building against those paths.
