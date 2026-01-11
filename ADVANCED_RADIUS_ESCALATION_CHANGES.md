# Advanced Radius Escalation Logic - Implementation Changes List

## 📋 Overview
This document outlines ALL the changes needed to implement the **Advanced Radius Escalation Logic** as per the ROUND2_ROADMAP.

The feature implements a multi-stage radius escalation:
- **Stage 1**: Radius 1 (5 km) - Initial search
- **Stage 2**: Radius 2 (15 km) - After 10 minutes if blood not found
- **Stage 3**: Radius 3 (50 km) - After 20 minutes if blood still not found
- **Stage 4**: NGO Fallback - If all radius searches fail

---

## 🗂️ FILES TO CREATE (New Files)

### 1. **Backend - New Service/Utility**
**File**: `Backend/services/RadiusEscalationHandler.js`

**Purpose**: Manage the radius escalation logic, timing, and state

**What to include**:
- Escalation configuration (radius values, time thresholds)
- Track escalation stages for each request
- Calculate next radius based on time elapsed
- Determine when to escalate
- Manage timeout scheduling
- Reset escalation on success

**Key Methods**:
- `getEscalationStages()` - Return config: radius 1 (5km), radius 2 (15km), radius 3 (50km)
- `getTimeThresholds()` - Return: stage 2 after 10 min, stage 3 after 20 min
- `shouldEscalate(requestId, timeElapsed)` - Check if should move to next stage
- `getNextRadius(currentRadius)` - Return next radius to search
- `getNextStage(currentStage)` - Return next escalation stage
- `isFinalized(stage)` - Check if all radius searches exhausted

**Database Schema** (new collection):
```javascript
{
  _id: ObjectId,
  requestId: ObjectId,
  bloodBankId: ObjectId,
  hospitalId: ObjectId,
  currentStage: 1,          // 1-4 (4 = NGO fallback)
  currentRadius: 5,         // in km
  createdAt: Date,
  stagedAtTime: [
    { stage: 1, timestamp: Date, radiusKm: 5, resultCount: 10 },
    { stage: 2, timestamp: Date, radiusKm: 15, resultCount: 5 }
  ],
  totalDonorsFound: [],     // Array of donor IDs found at each stage
  bloodFound: false,
  finalizedAt: Date,
  escalationLog: [...]      // History of escalation events
}
```

---

### 2. **Backend - New Service for Scheduling**
**File**: `Backend/services/EscalationScheduler.js`

**Purpose**: Handle time-based escalation triggers

**What to include**:
- Schedule escalation checks at intervals
- Trigger escalation after time thresholds
- Queue escalation tasks
- Handle retries if searches fail
- Cancel escalation if blood found early
- Store escalation schedule state

**Key Methods**:
- `scheduleEscalation(requestId, initialDelay)` - Schedule first escalation check
- `checkAndEscalate(requestId)` - Check if time threshold met, escalate if needed
- `cancelEscalation(requestId)` - Cancel scheduled escalations
- `recordEscalationEvent(requestId, stage)` - Log escalation event
- `getEscalationStatus(requestId)` - Get current escalation info

---

### 3. **Frontend - New Component**
**File**: `Frontend/src/components/EscalationStatusDisplay.jsx`

**Purpose**: Show escalation status to hospital staff

**What to include**:
- Display current escalation stage (visual indicators)
- Show time elapsed since request creation
- Show countdown to next escalation
- Display number of donors found at each stage
- Color-coded stage indicators
- Timeline visualization

**States to display**:
- Stage 1 (5 km) - Searching...
- Stage 2 (15 km) - Expanding search after 10 min
- Stage 3 (50 km) - Broader search after 20 min
- Stage 4 - NGO fallback triggered

---

## 🔧 FILES TO MODIFY (Existing Files)

### Backend Changes

#### 1. **Backend/models/admin/HospitalBloodRequest.js** (Blood Request Model)

**Changes needed**:

**A. Add escalation fields to schema**:
```javascript
// Add to schema:
escalationStage: {
  type: Number,
  default: 1,
  enum: [1, 2, 3, 4],  // 4 = NGO fallback
  index: true
},
currentRadius: {
  type: Number,
  default: 5,          // km
  enum: [5, 15, 50]
},
radiusSearches: [{
  stage: Number,
  radius: Number,
  timestamp: Date,
  donorsFound: Number,
  bloodFoundCount: Number
}],
escalationStartedAt: Date,
escalationTimeline: [{
  event: String,       // "initiated", "escalated_stage_2", etc
  stage: Number,
  timestamp: Date,
  timeElapsed: Number, // milliseconds
  radius: Number
}],
ngoDriveTriggered: Boolean,
ngoDriveTriggeredAt: Date
```

**B. Add methods**:
```javascript
async updateEscalationStage(requestId, newStage, newRadius)
async recordRadiusSearch(requestId, stage, radius, donorsFound)
async logEscalationEvent(requestId, event, stage, timestamp)
async triggerNGOFallback(requestId)
async getEscalationStatus(requestId)
```

---

#### 2. **Backend/controllers/hospital/HospitalBloodRequestController.js**

**Changes needed**:

**A. Modify `createRequest()` method**:
```javascript
// After creating request, add:
// Initialize escalation tracking
const escalationRecord = await EscalationScheduler.initializeEscalation(
  request._id,
  request.bloodBankId,
  request.hospitalId
);

// Schedule first escalation check (after 10 minutes for stage 2)
EscalationScheduler.scheduleEscalation(request._id, 10 * 60 * 1000);

// Schedule stage 3 escalation (after 20 minutes)
EscalationScheduler.scheduleEscalation(request._id, 20 * 60 * 1000);
```

**B. Add new method: `startEscalation()`**:
```javascript
static async startEscalation(req, res) {
  // Manually trigger escalation (for testing)
  // GET /api/hospital-blood-requests/:id/escalate
}
```

**C. Add new method: `getEscalationStatus()`**:
```javascript
static async getEscalationStatus(req, res) {
  // Get current escalation stage of a request
  // GET /api/hospital-blood-requests/:id/escalation-status
}
```

**D. Add new method: `recordRadiusSearch()`**:
```javascript
static async recordRadiusSearch(req, res) {
  // Record search results for a given radius
  // POST /api/hospital-blood-requests/:id/radius-search
  // Body: { stage, radius, donorsFound, bloodFoundCount }
}
```

---

#### 3. **Backend/controllers/hospital/DonorSearchController.js** (or similar)

**Changes needed**:

**A. Create/Update: `searchDonorsByRadius()`**:
```javascript
// Search donors within a specific radius
// POST /api/search/donors-by-radius
// Body: { hospitalId, latitude, longitude, radius, bloodType }
// Returns: List of donors and blood banks within radius
```

**B. Method should**:
- Use geospatial queries (MongoDB $near)
- Filter by blood type availability
- Sort by distance
- Return distance for each result
- Record search results with escalation handler

---

#### 4. **Backend/routes/hospital/HospitalBloodRequestRoutes.js**

**Add new routes**:
```javascript
// Escalation status and management
router.get(
  "/hospital-blood-requests/:id/escalation-status",
  HospitalBloodRequestController.getEscalationStatus
);

router.post(
  "/hospital-blood-requests/:id/escalate",
  HospitalBloodRequestController.startEscalation
);

router.post(
  "/hospital-blood-requests/:id/radius-search",
  HospitalBloodRequestController.recordRadiusSearch
);
```

---

#### 5. **Backend/routes/hospital/DonorSearchRoutes.js** (New or existing)

**Add new route**:
```javascript
router.post(
  "/search/donors-by-radius",
  DonorSearchController.searchDonorsByRadius
);

// Get escalation configuration
router.get(
  "/search/escalation-config",
  DonorSearchController.getEscalationConfig
);
```

---

#### 6. **Backend/models/admin/BloodStock.js**

**Changes needed**:
- Ensure location field has geospatial index: `db.bloodstocks.createIndex({ "location.coordinates": "2dsphere" })`
- Add method: `findNearby(latitude, longitude, radiusInKm, bloodGroup)`

---

### Frontend Changes

#### 1. **Frontend/src/pages/hospital/SearchBlood.jsx**

**Changes needed**:

**A. Update state**:
```javascript
const [escalationStage, setEscalationStage] = useState(1);
const [currentRadius, setCurrentRadius] = useState(5);
const [escalationTimeline, setEscalationTimeline] = useState([]);
const [donorsFoundPerStage, setDonorsFoundPerStage] = useState({
  stage1: 0, stage2: 0, stage3: 0
});
const [showEscalationUI, setShowEscalationUI] = useState(false);
const [timeElapsed, setTimeElapsed] = useState(0);
```

**B. Modify `handleSearch()` method**:
```javascript
// After initial search with 5km radius:
// 1. Send search request with radius = 5
// 2. Record results with escalation handler
// 3. Schedule escalation check for 10 minutes
// 4. Start time counter
// 5. If blood found, cancel scheduled escalations
// 6. Show escalation UI with status
```

**C. Add new method: `handleRadiusEscalation()`**:
```javascript
// Called when escalation timer triggers
// 1. Increase radius to next level (5 → 15 → 50)
// 2. Search again with new radius
// 3. Update UI with new results
// 4. Schedule next escalation
```

**D. Add new method: `getEscalationStatus()`**:
```javascript
// Fetch current escalation stage from backend
// Update escalationStage, currentRadius, escalationTimeline
```

**E. Add timer effect**:
```javascript
useEffect(() => {
  // Start timer counting time elapsed
  // Update every second
  // Check if time reached escalation thresholds (10min, 20min)
  // Trigger escalation automatically
}, [requestId, escalationStarted])
```

---

#### 2. **Frontend/src/components/EscalationStatusDisplay.jsx** (New Component)

**Display Information**:
- Current escalation stage (1-4)
- Radius being searched (5km/15km/50km/NGO)
- Time elapsed since request started
- Time until next escalation
- Donors found at each stage
- Visual timeline of escalation stages
- NGO fallback status

**UI Elements**:
- Stage indicators (badges with color coding)
- Radius display with animation
- Time counter
- Progress bar showing time to next escalation
- Donor count badges
- NGO indicator

---

#### 3. **Frontend/src/services/hospitalApi.jsx**

**Add new API functions**:

```javascript
// Get escalation configuration
export const getEscalationConfig = (token) =>
  axios.get(`${API_BASE}/search/escalation-config`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Search donors by radius
export const searchDonorsByRadius = (params, token) =>
  axios.post(`${API_BASE}/search/donors-by-radius`, params, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Get escalation status for a request
export const getEscalationStatus = (requestId, token) =>
  axios.get(`${API_BASE}/hospital-blood-requests/${requestId}/escalation-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Record radius search results
export const recordRadiusSearch = (requestId, searchData, token) =>
  axios.post(`${API_BASE}/hospital-blood-requests/${requestId}/radius-search`, searchData, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Manually trigger escalation
export const triggerEscalation = (requestId, token) =>
  axios.post(`${API_BASE}/hospital-blood-requests/${requestId}/escalate`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
```

---

#### 4. **Frontend/src/pages/hospital/BloodRequests.jsx**

**Changes needed**:
- Import and display `EscalationStatusDisplay` component
- Show escalation status for each active request
- Allow manual escalation trigger (admin button)
- Display escalation timeline in request details

---

## 📊 Database Changes

### Collections to Create/Modify

#### 1. **escalationrecords** (New Collection)
```javascript
{
  _id: ObjectId,
  requestId: ObjectId,
  hospitalId: ObjectId,
  bloodBankId: ObjectId,
  currentStage: Number,
  currentRadius: Number,
  createdAt: Date,
  escalationLog: Array
}

// Index
db.escalationrecords.createIndex({ requestId: 1 })
db.escalationrecords.createIndex({ hospitalId: 1 })
db.escalationrecords.createIndex({ createdAt: 1 })
```

#### 2. **Update hospitalbloodeque
sts collection**
```javascript
// Add indexes for geospatial queries
db.hospitalbloodequest.createIndex({ "hospital.location.coordinates": "2dsphere" })

// Add indexes for escalation
db.hospitalbloodequests.createIndex({ escalationStage: 1 })
db.hospitalbloodequests.createIndex({ escalationStartedAt: 1 })
```

#### 3. **Update bloodstocks collection**
```javascript
// Add geospatial index
db.bloodstocks.createIndex({ "location.coordinates": "2dsphere" })
```

---

## 🔄 Data Flow

### Search Initiation
```
Hospital initiates blood search
↓
radius = 5 km
stage = 1
↓
Search donors within 5 km
↓
Record results: { stage: 1, radius: 5, donorsFound: N }
↓
Schedule escalation check after 10 minutes
↓
Display results with escalation UI
```

### Escalation Trigger (After 10 minutes)
```
10 minute timer expires
↓
Check: Blood found? If YES → stop, return results
↓
If NO → move to next stage
↓
radius = 15 km
stage = 2
↓
Search donors within 15 km
↓
Record results: { stage: 2, radius: 15, donorsFound: M }
↓
Schedule escalation check after another 10 minutes (20 min total)
↓
Update UI with new results
```

### Final Escalation (After 20 minutes)
```
20 minute timer expires
↓
Check: Blood found? If YES → stop, return results
↓
If NO → move to final radius search
↓
radius = 50 km
stage = 3
↓
Search donors within 50 km (broader search)
↓
Record results: { stage: 3, radius: 50, donorsFound: K }
↓
If still no blood → Trigger NGO fallback (stage 4)
```

### NGO Fallback
```
50 km search exhausted without finding blood
↓
stage = 4 (NGO)
↓
Send alerts to NGOs
↓
NGO mobilizes donors/camps
↓
Continue monitoring for donations
```

---

## ⏰ Time-Based Escalation Schedule

```
T+0 min  : Search initiated (radius 5 km)
           ↓
T+10 min : If no blood found → escalate to 15 km radius
           ↓
T+20 min : If still no blood → escalate to 50 km radius
           ↓
T+30 min : If 50 km search fails → trigger NGO fallback
```

---

## 🎨 Frontend UI Changes

### SearchBlood.jsx Updates
- Add escalation status display
- Show current stage (1-4) with visual indicator
- Show radius being searched
- Show countdown timer to next escalation
- Show donors found at each stage
- Show NGO fallback status

### BloodRequests.jsx Updates
- Add escalation column showing current stage
- Add action button to trigger manual escalation
- Show escalation timeline in request details modal
- Add filter: "Show only escalated requests"

### New EscalationStatusDisplay Component
- Timeline visualization
- Stage indicators (badges)
- Radius information
- Time counter
- Donor count for each stage
- NGO status indicator

---

## 📝 Configuration Management

### Escalation Configuration Object
```javascript
{
  stages: [
    { stage: 1, radius: 5,  timeThreshold: 0,    label: "Local (5 km)" },
    { stage: 2, radius: 15, timeThreshold: 10,   label: "Regional (15 km)" },
    { stage: 3, radius: 50, timeThreshold: 20,   label: "Broader (50 km)" },
    { stage: 4, radius: 0,  timeThreshold: 30,   label: "NGO Fallback" }
  ],
  maxTimePerStage: 10,      // minutes
  totalSearchTime: 30,      // minutes before NGO fallback
  enableAutoEscalation: true,
  enableManualEscalation: true
}
```

**Storage**: 
- Backend config file: `Backend/config/escalationConfig.js`
- Fetched to frontend on app startup via API

---

## 🧪 Testing Requirements

### Unit Tests
- Escalation stage calculation
- Radius progression logic
- Time threshold checks
- Geospatial query functions
- Escalation record creation

### Integration Tests
- End-to-end blood search with escalation
- Auto-escalation after time thresholds
- Manual escalation trigger
- NGO fallback activation
- Cancel escalation on blood found

### Manual Testing
- Initiate search → verify stage 1 (5 km)
- Wait 10 min → verify auto-escalation to stage 2 (15 km)
- Wait 20 min total → verify auto-escalation to stage 3 (50 km)
- Wait 30 min total → verify NGO fallback triggered
- Find blood early → verify escalation cancelled
- Manual escalation button works
- UI updates correctly at each stage

---

## Summary Table

| Component | Type | Location | Purpose |
|-----------|------|----------|---------|
| RadiusEscalationHandler | Service | Backend | Manage escalation logic |
| EscalationScheduler | Service | Backend | Handle time-based triggers |
| Escalation Model Fields | Database | MongoDB | Store escalation data |
| EscalationStatusDisplay | Component | Frontend | Display status UI |
| SearchBlood.jsx | Updates | Frontend | Integrate escalation flow |
| HospitalBloodRequest Model | Updates | Backend | Add escalation fields |
| API Endpoints | New Routes | Backend | Escalation management APIs |
| Geospatial Queries | New | Backend | Radius-based donor search |
| Configuration | File | Backend | Escalation settings |

---

## Priority Order for Implementation

1. ✅ Create `RadiusEscalationHandler.js` service
2. ✅ Create `EscalationScheduler.js` service
3. ✅ Update `HospitalBloodRequest` model with escalation fields
4. ✅ Update `HospitalBloodRequestController` with escalation methods
5. ✅ Create geospatial query methods in `BloodStock` and `Donor` models
6. ✅ Add new backend routes for escalation
7. ✅ Create `EscalationStatusDisplay.jsx` component
8. ✅ Update `SearchBlood.jsx` with escalation logic
9. ✅ Update `BloodRequests.jsx` to display escalation status
10. ✅ Add API functions to `hospitalApi.jsx`
11. ✅ Update database indexes for geospatial queries
12. ✅ Create escalation configuration file
13. ✅ Add tests for all escalation functionality
