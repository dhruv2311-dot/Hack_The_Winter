# 🎯 Quick Reference Card - Organization-Scoped Authentication

## 📋 One-Page Reference

### Login Endpoint
```
POST /api/auth/login
Content-Type: application/json

{
  "organizationCode": "HOSP-DEL-001",
  "email": "doctor@hospital.com", 
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userCode": "HOSP-DOC-001",
    "role": "Doctor",
    "organizationCode": "HOSP-DEL-001"
  }
}
```

---

### Using the Token
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/organization-users/HOSP-DEL-001
```

---

### Middleware Stack

| Layer | Middleware | Function | Passes/Fails |
|-------|-----------|----------|-------------|
| 1 | `authMiddleware` | Verify JWT token | ✅ Continue / ❌ 401 |
| 2 | `organizationAuthMiddleware` | Check org scope | ✅ Continue / ❌ 403 |
| 3 | `roleMiddleware` | Check role (if needed) | ✅ Continue / ❌ 403 |

---

### HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Request succeeded |
| 201 | Created | User created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/missing token or credentials |
| 403 | Forbidden | No permission (org/role) |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Unexpected error |

---

### Endpoint Protection

```
Create User:     POST /create
                 → authMiddleware
                 → organizationAuthMiddleware
                 → roleMiddleware(["Admin"])

Get Users:       GET /:orgCode
                 → authMiddleware
                 → organizationAuthMiddleware

Get Stats:       GET /:orgCode/stats
                 → authMiddleware
                 → organizationAuthMiddleware
                 → roleMiddleware(["Admin"])

Delete User:     DELETE /:orgCode/:userCode
                 → authMiddleware
                 → organizationAuthMiddleware
                 → roleMiddleware(["Admin"])
```

---

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "No token provided" | Missing Authorization header | Add: `Authorization: Bearer <token>` |
| "Invalid token" | Token expired or corrupted | Login again to get fresh token |
| "You don't have access to this organization" | Org code mismatch | Use correct organization code in URL |
| "This action requires role(s): Admin" | User not Admin | Use Admin account |
| "Invalid credentials" | Wrong password/email/org | Check credentials |
| "User account is inactive" | User marked INACTIVE | Admin must activate |

---

### JWT Token Contains

```javascript
{
  userId: "507f...",
  userCode: "HOSP-DOC-001",
  organizationCode: "HOSP-DEL-001",    ← Key for org scoping
  organizationName: "Max Healthcare",
  organizationType: "hospital",
  role: "Doctor",                      ← Key for role checking
  email: "doctor@hospital.com",
  name: "Dr. John Doe"
}
```

---

### Roles & Permissions

| Role | Create User | View All | View Stats | Update User | Delete User | Change Password |
|------|:-----------:|:--------:|:----------:|:-----------:|:-----------:|:---------------:|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Doctor | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Technician | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Staff | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Volunteer | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |

---

### Organization Types

| Type | Code | Example | Typical Roles |
|------|------|---------|---------------|
| Hospital | HOSP-* | HOSP-DEL-001 | Doctor, Admin, Receptionist |
| Blood Bank | BLOOD-* | BLOOD-MUM-001 | Director, Technician, Admin, Staff |
| NGO | NGO-* | NGO-BNG-001 | President, Manager, Admin, Volunteer |

---

### Database Queries

```javascript
// Find user for login
db.organizationUsers.findOne({
  organizationCode: "HOSP-DEL-001",
  email: "doctor@hospital.com"
})

// Get all users in organization
db.organizationUsers.find({
  organizationCode: "HOSP-DEL-001"
})

// Create new user
db.organizationUsers.insertOne({
  organizationCode: "HOSP-DEL-001",
  userCode: "HOSP-DOC-002",
  email: "newdoctor@hospital.com",
  password: "$2a$10$...",  // bcrypt hashed
  role: "Doctor",
  status: "ACTIVE"
})
```

---

### Common cURL Commands

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"organizationCode":"HOSP-DEL-001","email":"doctor@hospital.com","password":"password123"}'
```

**Get Users**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/organization-users/HOSP-DEL-001
```

**Create User (Admin)**
```bash
curl -X POST http://localhost:5000/api/organization-users/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"organizationCode":"HOSP-DEL-001","name":"Dr. New","email":"new@hospital.com","password":"password123","role":"Doctor"}'
```

**Get Doctors**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/organization-users/HOSP-DEL-001/role/Doctor
```

**Change Password**
```bash
curl -X PUT http://localhost:5000/api/organization-users/HOSP-DEL-001/HOSP-DOC-001/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old123","newPassword":"new456"}'
```

---

### Files to Review

| File | Purpose | Read Time |
|------|---------|-----------|
| ORGANIZATION_AUTH_GUIDE.md | Complete architecture | 10 min |
| AUTH_TESTING_GUIDE.md | How to test | 15 min |
| SYSTEM_ARCHITECTURE_DIAGRAM.md | Visual flow | 5 min |
| IMPLEMENTATION_CHECKLIST.md | What was done | 10 min |
| OrganizationUser.js | Database model | 10 min |
| OrganizationUsersController.js | API handlers | 5 min |
| OrganizationUsersRoutes.js | Routes & middleware | 5 min |

---

### Troubleshooting Quick Guide

**User can't login**
- ✅ Check organizationCode is correct
- ✅ Check email exists in that org
- ✅ Check user status is ACTIVE
- ✅ Check password is correct

**User can't access org data**
- ✅ Check Authorization header present
- ✅ Check token is valid (not expired)
- ✅ Check organizationCode in URL matches token
- ✅ Check token not corrupted

**User can't perform admin action**
- ✅ Check user role is Admin
- ✅ Check user is ACTIVE
- ✅ Check token is valid
- ✅ Check organization matches

**Server errors**
- ✅ Check MongoDB running
- ✅ Check JWT_SECRET set
- ✅ Check app.js has routes registered
- ✅ Check middleware imports correct

---

### Environment Setup

```bash
# .env file
JWT_SECRET="your_secret_key_here"
MONGODB_URI="mongodb://localhost:27017/sebn"
PORT=5000
```

---

### Token Expiration

```javascript
// Currently set to 24 hours
{ expiresIn: "24h" }

// To change:
{ expiresIn: "7d" }   // 7 days
{ expiresIn: "12h" }  // 12 hours
{ expiresIn: "30d" }  // 30 days
```

---

### Security Checklist

✅ Organization isolation enforced
✅ Cross-org access blocked
✅ Role-based permissions working
✅ Passwords bcrypt hashed
✅ Tokens signed & verified
✅ User status validated
✅ Error handling robust
✅ Logging detailed

---

### Quick Start (5 minutes)

1. **Start server**: `npm start`
2. **Create org**: POST to organization endpoint
3. **Create admin user**: POST /api/organization-users/create
4. **Login**: POST /api/auth/login with org code + credentials
5. **Use token**: Add `Authorization: Bearer <token>` header
6. **Test**: GET /api/organization-users/{orgCode}

---

### Important URLs

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/auth/login | POST | Organization user login |
| /api/organization-users/create | POST | Create new user (Admin) |
| /api/organization-users/:orgCode | GET | Get all users |
| /api/organization-users/:orgCode/:userCode | GET | Get single user |
| /api/organization-users/:orgCode/role/:role | GET | Get users by role |
| /api/organization-users/:orgCode/stats | GET | Get statistics (Admin) |
| /api/organization-users/:orgCode/:userCode | PUT | Update user (Admin) |
| /api/organization-users/:orgCode/:userCode/password | PUT | Change password |
| /api/organization-users/:orgCode/:userCode | DELETE | Delete user (Admin) |

---

### Response Format

**Success Response**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response**
```json
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

---

**Print this page or bookmark it for quick reference!**

Last Updated: December 28, 2025
