# 🏗️ System Architecture Diagram

## Complete Organization-Scoped Authentication System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT APPLICATION                             │
│                                                                          │
│  1. User enters credentials + organization code                         │
│  2. Frontend sends POST /api/auth/login                                 │
│  3. Receives JWT token                                                  │
│  4. Stores token in localStorage/sessionStorage                         │
│  5. Sends token in Authorization header for all requests                │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         HTTP REQUEST                                    │
│                                                                          │
│  POST /api/auth/login                                                   │
│  {                                                                       │
│    organizationCode: "HOSP-DEL-001",                                    │
│    email: "doctor@hospital.com",                                        │
│    password: "password123"                                              │
│  }                                                                       │
│                                                                          │
│  OR                                                                      │
│                                                                          │
│  GET /api/organization-users/HOSP-DEL-001                              │
│  Header: Authorization: Bearer eyJhbGci...                              │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       ROUTE HANDLER LAYER                               │
│                    (Express Router)                                      │
│                                                                          │
│  ✅ Forwards to appropriate middleware stack                            │
│  ✅ Validates HTTP method                                               │
│  ✅ Checks route permissions                                            │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   MIDDLEWARE LAYER 1: AUTHENTICATION                    │
│                      (authMiddleware)                                    │
│                                                                          │
│  1. Extract token from Authorization header                             │
│  2. Verify JWT signature                                                │
│  3. Check token expiration                                              │
│  4. Decode token payload                                                │
│  5. Attach user data to req.user                                        │
│  6. Attach org context to req.organization                              │
│                                                                          │
│  On Error:                                                               │
│  ❌ No token → 401 "No token provided"                                  │
│  ❌ Invalid signature → 401 "Invalid token"                             │
│  ❌ Token expired → 401 "Token has expired"                             │
│                                                                          │
│  ✅ Token valid → Continue to next middleware                           │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              MIDDLEWARE LAYER 2: ORGANIZATION SCOPE                     │
│                (organizationAuthMiddleware)                              │
│                                                                          │
│  1. Read organizationCode from URL params                               │
│  2. Compare with req.user.organizationCode from token                   │
│  3. Check if codes match                                                │
│  4. Attach req.orgCode for controller use                               │
│                                                                          │
│  On Error:                                                               │
│  ❌ Codes don't match → 403 "You don't have access..."                  │
│  ❌ User not authenticated → 401 "Not authenticated"                    │
│                                                                          │
│  ✅ Codes match → Continue to next middleware                           │
│  ✅ Ensures user only accesses own organization                         │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               MIDDLEWARE LAYER 3: ROLE-BASED ACCESS                     │
│                    (roleMiddleware)                                      │
│                  [OPTIONAL - Only on Admin endpoints]                   │
│                                                                          │
│  1. Get required roles from middleware config                           │
│  2. Get user role from req.user.role                                    │
│  3. Check if user role in allowed roles                                 │
│                                                                          │
│  On Error:                                                               │
│  ❌ User role not in allowed roles → 403 "Requires: Admin"              │
│                                                                          │
│  ✅ User has required role → Continue to controller                     │
│  ✅ Ensures only authorized roles can perform action                    │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CONTROLLER LAYER                                   │
│                 (AuthController / OrgUsersController)                    │
│                                                                          │
│  req.user = {                                                            │
│    userId, userCode, organizationCode, organizationName,               │
│    organizationType, role, email, name                                  │
│  }                                                                       │
│                                                                          │
│  req.organization = { code, name, type }                                │
│  req.orgCode = organizationCode                                         │
│                                                                          │
│  ✅ Process request with full context                                   │
│  ✅ User is authenticated & authorized                                  │
│  ✅ Organization scope is verified                                      │
│  ✅ Role permissions are validated                                      │
│                                                                          │
│  For LOGIN:                                                              │
│  - Find user in organizationUsers                                       │
│  - Verify password                                                      │
│  - Check status = ACTIVE                                                │
│  - Generate JWT token                                                   │
│  - Return token + user data                                             │
│                                                                          │
│  For PROTECTED ENDPOINTS:                                                │
│  - All context already available                                        │
│  - Perform requested operation                                          │
│  - Return response                                                      │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      MODEL LAYER (Database)                             │
│                                                                          │
│  OrganizationUser.findByUserEmail(orgCode, email)                       │
│  → Database Query:                                                       │
│    db.organizationUsers.findOne({                                       │
│      organizationCode: orgCode,                                         │
│      email: email                                                       │
│    })                                                                    │
│                                                                          │
│  Returns full user document with password for verification              │
│                                                                          │
│  Collections:                                                            │
│  ├── organizationUsers (primary)                                        │
│  │   ├── _id, organizationCode, userCode                               │
│  │   ├── email, password (bcrypt hashed)                                │
│  │   ├── name, role, status                                             │
│  │   └── organizationName, organizationType                             │
│  │                                                                      │
│  └── organizations (referenced)                                         │
│      ├── organizationCode, name, type                                   │
│      └── ... other org data                                             │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                                │
│                                                                          │
│  organizationUsers {                                                     │
│    _id: ObjectId,                                                       │
│    organizationCode: "HOSP-DEL-001",                                    │
│    organizationName: "Max Healthcare Delhi",                            │
│    organizationType: "hospital",                                        │
│    userCode: "HOSP-DOC-001",                                            │
│    name: "Dr. John Doe",                                                │
│    email: "doctor@hospital.com",                                        │
│    password: "$2a$10$...",  ← bcrypt hashed                             │
│    role: "Doctor",                                                      │
│    status: "ACTIVE",                                                    │
│    createdAt: ISODate,                                                  │
│    updatedAt: ISODate                                                   │
│  }                                                                       │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       RESPONSE FLOW                                     │
│                                                                          │
│  ✅ Generate Response                                                   │
│  ✅ Set HTTP Status Code                                                │
│  ✅ Send JSON response                                                  │
│  ✅ Set any necessary headers                                           │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      HTTP RESPONSE                                      │
│                                                                          │
│  For LOGIN (200):                                                        │
│  {                                                                       │
│    success: true,                                                       │
│    message: "Login successful",                                         │
│    token: "eyJhbGciOiJIUzI1NiIs...",                                   │
│    user: {                                                               │
│      _id, userCode, name, email, role,                                  │
│      organizationCode, organizationName, organizationType              │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
│  For PROTECTED ENDPOINT (200):                                           │
│  {                                                                       │
│    success: true,                                                       │
│    message: "Success message",                                          │
│    data: { ... }                                                        │
│  }                                                                       │
│                                                                          │
│  For ERRORS:                                                             │
│  ❌ 401: Not authenticated                                              │
│  ❌ 403: Not authorized (org/role)                                      │
│  ❌ 404: Not found                                                      │
│  ❌ 500: Server error                                                   │
└────────────────────────┬────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLIENT APPLICATION                                 │
│                                                                          │
│  Receives response:                                                      │
│  ✅ Stores token (if login)                                             │
│  ✅ Updates UI with data                                                │
│  ✅ Handles errors                                                      │
│  ✅ Redirects as needed                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 JWT Token Structure

```
Header.Payload.Signature

HEADER:
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD (Contains Organization Context):
{
  "userId": "507f1f77bcf86cd799439011",
  "userCode": "HOSP-DOC-001",
  "organizationCode": "HOSP-DEL-001",      ← KEY: Organization code
  "organizationName": "Max Healthcare",
  "organizationType": "hospital",
  "role": "Doctor",                        ← KEY: User role
  "email": "doctor@hospital.com",
  "name": "Dr. John Doe",
  "iat": 1703836800,
  "exp": 1703923200                        ← 24 hours from now
}

SIGNATURE:
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "your_jwt_secret"
)
```

---

## 🔒 Organization Isolation Example

```
SCENARIO 1: Doctor from Hospital A tries to access Hospital A data
─────────────────────────────────────────────────────────────────

Request:
GET /api/organization-users/HOSP-DEL-001
Header: Authorization: Bearer <HOSP-DOC-001-token>

Token Payload: organizationCode = "HOSP-DEL-001"
URL Parameter: organizationCode = "HOSP-DEL-001"

organizationAuthMiddleware Check:
HOSP-DEL-001 == HOSP-DEL-001 ✅

Result: ✅ ACCESS ALLOWED - Continue to controller


SCENARIO 2: Doctor from Hospital A tries to access Blood Bank data
──────────────────────────────────────────────────────────────────

Request:
GET /api/organization-users/BLOOD-MUM-001
Header: Authorization: Bearer <HOSP-DOC-001-token>

Token Payload: organizationCode = "HOSP-DEL-001"
URL Parameter: organizationCode = "BLOOD-MUM-001"

organizationAuthMiddleware Check:
HOSP-DEL-001 != BLOOD-MUM-001 ❌

Result: ❌ ACCESS DENIED
Response: 403 "You don't have access to this organization"


SCENARIO 3: Doctor tries to create user (Admin-only action)
────────────────────────────────────────────────────────────

Request:
POST /api/organization-users/create
Header: Authorization: Bearer <HOSP-DOC-001-token>
Body: { organizationCode, name, email, password, role }

authMiddleware: ✅ Token verified - User is HOSP-DOC-001
organizationAuthMiddleware: ✅ Org scope validated
roleMiddleware: Check if role = "Admin" ❌ Role is "Doctor"

Result: ❌ ACCESS DENIED
Response: 403 "This action requires role(s): Admin. You have role: Doctor"
```

---

## 📊 Request Flow Summary

```
┌─────────────┐
│   REQUEST   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│  authMiddleware             │
│  - Verify JWT               │
│  - Extract user data        │
└──────┬──────────────────────┘
       │
       ├─→ Token Invalid → 401 ✗
       │
       ▼
┌─────────────────────────────┐
│  organizationAuthMiddleware │
│  - Check org scope          │
│  - Validate URL org code    │
└──────┬──────────────────────┘
       │
       ├─→ Org mismatch → 403 ✗
       │
       ▼
┌─────────────────────────────┐
│  roleMiddleware (if needed) │
│  - Check user role          │
│  - Validate permissions     │
└──────┬──────────────────────┘
       │
       ├─→ Role insufficient → 403 ✗
       │
       ▼
┌─────────────────────────────┐
│      CONTROLLER             │
│  - Process request          │
│  - Query database           │
│  - Return response          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│      RESPONSE               │
│  ✅ 200 OK with data        │
│  ✅ 201 Created             │
│  ✅ 204 No Content          │
└─────────────────────────────┘
```

---

## 🛡️ Security Layers

```
┌──────────────────────────────────────────────────┐
│         LAYER 1: AUTHENTICATION                  │
│  Verifies user identity via JWT token            │
│  ✅ Valid signature                              │
│  ✅ Not expired                                  │
│  ✅ User data intact                             │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│      LAYER 2: ORGANIZATION SCOPE                 │
│  Ensures user only accesses their organization   │
│  ✅ URL org code matches token org code          │
│  ✅ No cross-organization access                 │
│  ✅ Organization context validated              │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│         LAYER 3: AUTHORIZATION                   │
│  Verifies user has permission for action         │
│  ✅ Role has required permission                 │
│  ✅ Status is ACTIVE                             │
│  ✅ Role-based access enforced                   │
└───────────────────┬────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────┐
│         DATA LAYER SECURITY                      │
│  Protects against unauthorized data access      │
│  ✅ Password hashed (bcrypt)                     │
│  ✅ Sensitive data not exposed                   │
│  ✅ Database queries filtered by org             │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Endpoint Protection Matrix

```
Endpoint                              Auth  Org   Role      Protection Level
───────────────────────────────────── ───── ───── ───────── ──────────────────
POST   /api/auth/login                ✗     ✗     ✗         Public
GET    /api/organization-users/:code  ✅    ✅    ✗         Medium (Org scoped)
POST   /api/organization-users/create ✅    ✅    Admin ✅   High (Role + Org)
DELETE /api/organization-users/:code  ✅    ✅    Admin ✅   High (Role + Org)
GET    /api/organization-users/stats  ✅    ✅    Admin ✅   High (Role + Org)
PUT    /password/:code                ✅    ✅    ✗         Medium (Org scoped)
```

---

**Architecture Diagram** - Organization-Scoped Authentication System
Last Updated: December 28, 2025
