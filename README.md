# BloodLink - Blood Donation Management System

A comprehensive blood donation management platform with NGO camp management, donor registration, hospital blood requests, and administrative controls.

## 📋 Table of Contents
- [Project Structure](#project-structure)
- [Recent Features](#recent-features)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [File Changes & Updates](#file-changes--updates)

---

## 🏗️ Project Structure

```
BloodLink/
├── Backend/
│   ├── app.js                          (Main Express server)
│   ├── server.js                       (Server entry point)
│   ├── package.json
│   ├── config/
│   │   └── db.js                       (MongoDB connection)
│   ├── controllers/
│   │   ├── admin/                      (Admin controllers)
│   │   ├── Auth/
│   │   ├── Donor/
│   │   │   └── DonorController.js      (Donor registration logic)
│   │   ├── NGO/
│   │   │   └── NgoController.js        (Camp & slot management)
│   │   └── organization/
│   ├── models/
│   │   ├── admin/
│   │   ├── donor/
│   │   │   ├── Donor.js
│   │   │   └── Donation.js
│   │   ├── ngo/
│   │   │   ├── NgoCamp.js              (Camp model)
│   │   │   ├── CampSlot.js             (Time slot model)
│   │   │   ├── CampRegistration.js     (Registration tracking)
│   │   │   ├── NgoCamp.js
│   │   │   └── User.js
│   │   └── organization/
│   ├── routes/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── donor/
│   │   │   └── DonorRoutes.js
│   │   ├── ngo/
│   │   │   └── NgoRoutes.js            (Camp & slot routes)
│   │   └── organization/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── adminAuth.middleware.js
│   │   ├── organizationAuth.middleware.js
│   │   ├── role.middleware.js
│   │   └── rateLimiter.js
│   └── utils/
│       ├── responseHandler.js
│       ├── validators.js
│       ├── codeGenerator.js
│       └── constants.js
│
├── Frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   └── DonorRegistration.jsx   (Camp & slot selection UI)
│   │   └── services/
│   ├── public/
│   └── assets/
│
└── README.md                           (This file)
```

---

## ✨ Recent Features Implemented

### 1️⃣ Blood Donation Camp Selection
**Status**: ✅ Complete & Working

**What's New:**
- Donors can now select from available blood donation camps during registration
- Shows camp name, location, and date
- Real-time camp data from database
- Public API endpoint (no authentication required)

**Implementation:**
- Backend Endpoint: `GET /api/public/camps`
- Frontend Component: DonorRegistration.jsx (Camp Selection Dropdown)
- Database Collection: `ngoCamps`

**Files Modified:**
- `Backend/app.js` - Added public camps endpoint
- `Frontend/src/pages/DonorRegistration.jsx` - Added camp dropdown UI

---

### 2️⃣ Dynamic Time Slot Management (NEW!)
**Status**: ✅ Complete & Working

**What's New:**
- Time slots automatically load based on selected camp
- Shows available spots for each slot
- Dynamic availability checking
- Slots disable when full
- Loading states & error handling

**Implementation:**
- Backend Endpoint: `GET /api/public/camps/:campId/slots`
- Database Collection: `campSlots`
- Frontend Logic: useEffect hook with camp dependency

**Features:**
- ✅ 7 pre-configured time slots (6 AM - 8 PM)
- ✅ Configurable max donors per slot
- ✅ Real-time availability display
- ✅ Disabled slots when full
- ✅ Loading & error states

**Files Modified:**
- `Backend/app.js` - Added public slots endpoint + test endpoint
- `Frontend/src/pages/DonorRegistration.jsx` - Added slot selection UI

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file with:
MONGO_URI=mongodb://localhost:27017/bloodlink
CORS_ORIGIN=http://localhost:5173
PORT=5000

# Start server
npm start
```

Server runs on: `http://localhost:5000`

### Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 📊 API Endpoints

### Public Endpoints (No Authentication)

#### 1. Get All Available Camps
```
GET /api/public/camps
```
**Response:**
```json
{
  "success": true,
  "message": "Found 3 camps",
  "camps": [
    {
      "_id": "60d5ec49f1b2c72b1c8e4a1a",
      "campName": "Red Cross Blood Camp - Delhi",
      "location": "Central Hospital, New Delhi",
      "city": "New Delhi",
      "startDate": "2025-01-10",
      "endDate": "2025-01-20"
    }
  ]
}
```

#### 2. Get Time Slots for a Camp
```
GET /api/public/camps/:campId/slots
```
**Response:**
```json
{
  "success": true,
  "message": "Found 7 slots",
  "slots": [
    {
      "_id": "60d5ec49f1b2c72b1c8e4a2b",
      "slotTime": "06:00 AM - 08:00 AM",
      "maxDonors": 10,
      "bookedCount": 2,
      "availableSpots": 8
    }
  ]
}
```

### Donor Endpoints (User Only)

#### 3. Register Donor
```
POST /api/donor/register
```
**Headers:**
```
Content-Type: application/json
```
**Request Body:**
```json
{
  "name": "John Doe",
  "age": 28,
  "gender": "Male",
  "bloodGroup": "O+",
  "mobileNumber": "9876543210",
  "city": "Delhi",
  "address": "123 Main St",
  "email": "john@example.com",
  "donationDate": "2025-02-01",
  "donationTime": "09:00 AM - 10:00 AM",
  "campId": "60d5ec49f1b2c72b1c8e4a1a",
  "slotId": "60d5ec49f1b2c72b1c8e4a2b",
  "campName": "Red Cross Blood Camp",
  "campLocation": "Central Hospital"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donor registered successfully",
  "donorId": "60d5ec49f1b2c72b1c8e4a3c"
}
```

### NGO/Admin Endpoints (Protected)

#### 4. Create Camp (ADMIN only)
```
POST /api/ngo/camp
Authentication: Required (Bearer Token)
```

#### 5. Get Camp Slots
```
GET /api/ngo/camp/:campId/slots
Authentication: Required (Bearer Token)
```

#### 6. Create Time Slot
```
POST /api/ngo/slot
Authentication: Required (Bearer Token)
```

### Test Endpoints (For Development)

#### 7. Create Sample Camps
```
POST /api/test/create-sample-camps
```
**Creates 3 sample camps for testing**

#### 8. Create Sample Time Slots
```
POST /api/test/create-sample-slots
```
**Creates 7 time slots for each existing camp**

---

## 🗄️ Database Schema

### Collections Overview

#### ngoCamps Collection
```javascript
{
  _id: ObjectId,
  campName: String,              // e.g., "Red Cross Blood Camp"
  location: String,              // e.g., "Central Hospital, Delhi"
  city: String,                  // e.g., "Delhi"
  state: String,                 // e.g., "Delhi"
  pincode: String,               // e.g., "110001"
  description: String,           // Optional camp description
  contactPersonName: String,     // Contact person name
  contactMobile: String,         // Contact mobile number
  startDate: Date,               // Camp start date
  endDate: Date,                 // Camp end date
  status: String,                // "pending" | "approved" | "active" | "completed" | "cancelled"
  isActive: Boolean,             // Default: true
  expectedDonors: Number,        // Expected donors count
  totalSlots: Number,            // Number of time slots
  createdAt: Date,
  updatedAt: Date
}
```

#### campSlots Collection
```javascript
{
  _id: ObjectId,
  campId: ObjectId,              // Reference to ngoCamps._id
  slotTime: String,              // e.g., "09:00 AM - 10:00 AM"
  maxDonors: Number,             // Max capacity (default: 10)
  bookedCount: Number,           // Currently booked donors (default: 0)
  availableSpots: Number,        // maxDonors - bookedCount (calculated)
  createdAt: Date,
  updatedAt: Date
}
```

#### donors Collection
```javascript
{
  _id: ObjectId,
  name: String,
  age: Number,
  gender: String,
  bloodGroup: String,            // "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-"
  mobileNumber: String,          // 10 digits
  city: String,
  address: String,
  email: String,                 // Optional
  donationDate: Date,
  donationTime: String,
  nextDonationDate: Date,        // 90 days after donation
  campId: ObjectId,              // Reference to ngoCamps
  slotId: ObjectId,              // Reference to campSlots
  campName: String,
  campLocation: String,
  status: String,                // "registered" | "completed" | "cancelled"
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📝 File Changes & Updates

### Backend Files Modified

#### 1. `Backend/app.js`
**Lines Changed:** ~100 additions
**Changes Made:**
- Added import for `getDB` from config
- Added `GET /api/public/camps` endpoint
- Added `GET /api/public/camps/:campId/slots` endpoint
- Added `POST /api/test/create-sample-camps` endpoint
- Added `POST /api/test/create-sample-slots` endpoint

**Key Functions:**
```javascript
// Get all active camps
app.get("/api/public/camps", async (req, res) => {
  // Queries ngoCamps where isActive=true
  // Returns formatted camp data
})

// Get slots for a specific camp
app.get("/api/public/camps/:campId/slots", async (req, res) => {
  // Queries campSlots by campId
  // Returns slots with available spots
})

// Create sample camps (test)
app.post("/api/test/create-sample-camps", async (req, res) => {
  // Creates 3 pre-configured camps
})

// Create sample slots (test)
app.post("/api/test/create-sample-slots", async (req, res) => {
  // Creates 7 slots for each camp
})
```

#### 2. `Backend/models/ngo/NgoCamp.js`
**Status:** ✅ No changes needed
**Usage:** Camp schema for database operations

#### 3. `Backend/models/ngo/CampSlot.js`
**Status:** ✅ No changes needed
**Usage:** Time slot schema with camp reference

---

### Frontend Files Modified

#### 1. `Frontend/src/pages/DonorRegistration.jsx`
**Lines Changed:** ~150 modifications
**Changes Made:**

**State Variables Added:**
```javascript
const [slotsLoading, setSlotsLoading] = useState(false);
const [slots, setSlots] = useState([]);
const [selectedSlot, setSelectedSlot] = useState(null);
```

**FormData Updated:**
```javascript
donationTime: "",    // Now from slot instead of hardcoded
campId: "",
slotId: "",         // NEW: stores selected slot ID
```

**Hooks Added:**
```javascript
// Fetch slots when camp selected
useEffect(() => {
  if (!selectedCamp) return;
  
  // Calls: GET /api/public/camps/{campId}/slots
  // Updates slots state
}, [selectedCamp])
```

**New Handler Function:**
```javascript
const handleSlotSelection = (slot) => {
  setSelectedSlot(slot);
  setFormData(prev => ({
    ...prev,
    slotId: slot._id.toString()
  }));
}
```

**UI Components Added:**
```jsx
// Time slot selector with:
- Loading state
- No camp selected message
- No slots available message
- Available spots display
- Disabled slots when full
- Green confirmation when selected
```

**Form Validation Updated:**
- Now requires: `selectedCamp && selectedSlot`
- Error message: "Please fill in all required fields including camp and time slot selection"

**Submit Payload Modified:**
```javascript
{
  // ... other fields
  donationTime: selectedSlot.slotTime,  // From slot instead of form
  campId: formData.campId,
  slotId: formData.slotId,              // NEW
  // ... rest
}
```

---

## 🧪 Testing Instructions

### Quick Test Setup (3 commands)

```bash
# 1. Create sample camps
curl -X POST http://localhost:5000/api/test/create-sample-camps

# 2. Create sample time slots
curl -X POST http://localhost:5000/api/test/create-sample-slots

# 3. Restart backend (if needed)
cd Backend && npm start
```

### Manual Testing in Frontend

1. **Navigate to Registration Page**
   - URL: `http://localhost:5173/donor-registration`

2. **Fill Basic Information**
   - Name, Age, Gender, Blood Group
   - Mobile Number, City
   - Address (optional), Email (optional)

3. **Select Camp**
   - Open "Select Blood Donation Camp" dropdown
   - Should show 3 camps (or your custom camps)
   - Click to select

4. **Verify Slots Load**
   - Time slot dropdown should become active
   - Should show 7 slots with available spots
   - Example: "06:00 AM - 08:00 AM (8 spots available)"

5. **Select Time Slot**
   - Choose any available slot
   - Green confirmation appears

6. **Complete Registration**
   - Fill donation date
   - Submit form
   - Should see success message

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| No camps showing | Run: `curl -X POST http://localhost:5000/api/test/create-sample-camps` |
| No slots showing | Run: `curl -X POST http://localhost:5000/api/test/create-sample-slots` |
| 404 on camps API | Ensure backend is running on port 5000 |
| Frontend not connecting | Check CORS_ORIGIN in .env matches frontend URL |
| Slots don't load after camp selection | Check browser console for errors, verify campId is valid |
| Database connection issues | Verify MongoDB is running and MONGO_URI is correct |

---

## 📋 Registration Form Flow

```
┌─────────────────────────────────────┐
│   Fill Basic Information Form       │
│  (Name, Age, Gender, Blood Group)   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Select Blood Donation Camp      │
│   (Dropdown loads from API)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Select Time Slot for Camp       │
│  (Slots load based on selected      │
│   camp from campSlots collection)   │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Select Donation Date            │
│  (Future date, not in past)         │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│     Submit Registration             │
│  (Validates all fields)             │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Success! Saved to Database        │
│   Redirect to Home Page             │
└─────────────────────────────────────┘
```

---

## 🎯 Key Features Summary

| Feature | Status | Implementation |
|---------|--------|-----------------|
| Camp Selection Dropdown | ✅ Complete | API + Frontend UI |
| Dynamic Time Slots | ✅ Complete | API + Frontend UI |
| Availability Display | ✅ Complete | Calculated in frontend |
| Loading States | ✅ Complete | Shown during fetch |
| Error Handling | ✅ Complete | Toast notifications |
| Form Validation | ✅ Complete | Camp + Slot required |
| Database Storage | ✅ Complete | MongoDB collections |
| Test Data Endpoints | ✅ Complete | Quick testing setup |

---

## 📞 Contact & Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all services are running
3. Check browser console for errors
4. Verify database connection

---

**Last Updated:** December 30, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
