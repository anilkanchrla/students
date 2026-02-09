# Data Flow Reference Card

## What Happens When You Close and Reopen a Tab

```
👤 USER CLOSES TAB
    ↓
📱 Browser closes (but data is still in localStorage + Firebase)

---

👤 USER OPENS APP AGAIN
    ↓
⏱️ STEP 1: INSTANT RESTORE (100ms)
    └─→ Load from localStorage
    └─→ Users: ✅ Appear immediately
    └─→ Students: ✅ Appear immediately
    └─→ Current User: ✅ Restored
    
    ↓
⏳ STEP 2: BACKGROUND SYNC (1-3 seconds)
    └─→ Try to connect to Firebase
    └─→ IF successful:
        └─→ Fetch latest agents from cloud
        └─→ Fetch latest students from cloud
        └─→ If cloud has newer data → Update display
    └─→ IF failed:
        └─→ Show warning in console only
        └─→ Keep using localStorage data
        └─→ App continues working normally

---

✅ RESULT: Data always visible (even if offline or Firebase is slow)
```

---

## Where Data is Stored

```
┌─────────────────────────────────────────┐
│     LOCAL BROWSER (Fast Access)          │
├─────────────────────────────────────────┤
│  localStorage                            │
│  ├─ app_users: [agents list]             │
│  ├─ app_students: [students list]        │
│  └─ app_currentUser: {logged in user}    │
└─────────────────────────────────────────┘
         ↕ Syncs (on load & on changes)
┌─────────────────────────────────────────┐
│   FIREBASE CLOUD (Persistent)             │
├─────────────────────────────────────────┤
│  Firestore Collections:                  │
│  ├─ users/                               │
│  │  └─ {uid}                             │
│  │     ├─ name, agentId, mobile, ...     │
│  │     └─ role: "agent"                  │
│  └─ students/                            │
│     └─ {studentId}                       │
│        ├─ StudentName, MobileNumber, ... │
│        └─ agentId, status, ...           │
└─────────────────────────────────────────┘
```

---

## Creating a New Agent - Full Flow

```
ADMIN FORM
    ↓
handleAddAgent()
    ├─→ createUserWithEmailAndPassword (Firebase Auth)
    ├─→ setDoc to Firestore users/{uid} ✅ SAVED TO CLOUD
    ├─→ onAddAgent(newAgent) callback
    │    └─→ setUsers([...users, newAgent])
    │         └─→ useEffect saves to localStorage ✅ SAVED LOCALLY
    └─→ Show success message

---

ANOTHER BROWSER LOADS YOUR APP
    ├─→ Step 1: Load from localStorage (empty - first time)
    └─→ Step 2: Load from Firebase
         └─→ getAllAgents() queries users collection
             └─→ WHERE role == "agent"
             └─→ New agent visible! ✅
```

---

## Creating a Student Record - Full Flow

```
AGENT FORM
    ↓
handleNewEnquiry(studentData)
    ├─→ saveNewStudent(data)
    │   └─→ addDoc to Firestore students/ ✅ SAVED TO CLOUD
    │       └─→ Returns {id: firebaseId, ...data}
    ├─→ setStudents([...students, newStudent])
    │   └─→ useEffect saves to localStorage ✅ SAVED LOCALLY
    └─→ Move to step 2 (Application Fee)

---

ANOTHER DEVICE/BROWSER LOADS YOUR APP
    ├─→ Step 1: Load from localStorage (empty - first time)
    └─→ Step 2: Load from Firebase
         └─→ getAllStudents() queries students collection
             └─→ No WHERE filter (gets ALL students)
             └─→ Student visible! ✅
```

---

## Updating Student Progress - Full Flow

```
AGENT UPDATES FEE PAYMENT
    ↓
updateStudentProgress(data, step, stageName)
    ├─→ updateStudent(studentId, updatedData)
    │   └─→ updateDoc in Firestore students/{id} ✅ SAVED TO CLOUD
    │       └─→ Sets updatedAt: new timestamp
    ├─→ setStudents([...map and update])
    │   └─→ useEffect saves to localStorage ✅ SAVED LOCALLY
    └─→ Move to next step

---

STATUS IN FIREBASE:
  students/{id}
  ├─ currentStage: "Application Fee Paid"
  ├─ applicationFee: true
  └─ updatedAt: "2026-02-09T10:30:00Z"
```

---

## When Connection is Lost

```
NO INTERNET / FIREBASE DOWN
    ↓
User tries to create student
    ├─→ saveNewStudent() fails
    │   └─→ Error caught, console logs error
    └─→ Alert: "Error saving student"
        └─→ Data NOT added to local state

---

BUT EXISTING DATA STILL VISIBLE:
  Previous data stays in localStorage
  User can browse, read info
  New creates/updates queued until online
```

---

## Deleting Agent - Full Flow

```
ADMIN CLICKS DELETE
    ↓
Confirmation dialog
    ├─→ User clicks OK
    └─→ handleDeleteAgent(agent)
        ├─→ deleteDoc from Firestore users/{uid} ✅ DELETED FROM CLOUD
        ├─→ onDeleteAgent(agent) callback
        │   └─→ setUsers(users.filter(...)) ✅ REMOVED LOCALLY
        └─→ Agent disappears from list

---

ANOTHER BROWSER/ADMIN:
  Next time they refresh/reload:
    └─→ getAllAgents() from Firebase
        └─→ "Deleted Agent" NOT IN LIST! ✅
```

---

## The 3-Part Data Strategy

```
┌──────────────────────────────────────────────────────────┐
│ 1. INSTANT ACCESS (localStorage)                         │
│    - Loads in 100ms                                      │
│    - Works offline                                       │
│    - Cache of last known data                            │
└──────────────────────────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────┐
│ 2. RELIABLE SYNC (Firebase Firestore)                    │
│    - Cloud database                                      │
│    - Single source of truth                              │
│    - Real-time updates from other users                  │
│    - Persistent storage                                  │
└──────────────────────────────────────────────────────────┘
                          ↕
┌──────────────────────────────────────────────────────────┐
│ 3. SMART MERGING (App Logic)                             │
│    - Load localStorage first (fast)                      │
│    - Sync Firebase in background (reliable)              │
│    - If Firebase fails → keep localStorage (resilient)   │
│    - If Firebase succeeds → override with cloud (accurate)│
└──────────────────────────────────────────────────────────┘
```

---

## Console Messages You'll See

### On Fresh Load (First Time)
```
✓ Loaded users from localStorage
✓ Loaded students from localStorage
✓ Loaded current user from localStorage
⏳ Syncing with Firebase...
ℹ No agents found in Firebase, using localStorage
ℹ No students found in Firebase, using localStorage
```

### On Fresh Load (With Existing Data in Cloud)
```
✓ Loaded users from localStorage
✓ Loaded students from localStorage
✓ Loaded current user from localStorage
⏳ Syncing with Firebase...
✓ Loaded agents from Firebase: 2
✓ Loaded students from Firebase: 5
```

### When Creating New Agent
```
User created with UID: abc123xyz...
Firebase: Stored agent details...
Firebase: Retrieved 1 agents
Agent created successfully!
```

### When Network Connection Lost
```
⚠ Error syncing with Firebase (continuing with localStorage): 
  FirebaseError: Permission denied (network)
[App continues with localStorage data]
```

---

## Key Points to Remember

✅ **Data is saved to THREE places**:
  1. Firestore (cloud)
  2. localStorage (browser cache)
  3. React state (memory)

✅ **On app load, data comes FROM**:
  1. First: localStorage (fast)
  2. Then: Firebase (reliable)

✅ **When you switch browsers**:
  - New browser has empty localStorage
  - But Firebase has your data
  - So data still appears

✅ **When you close the tab**:
  - localStorage still exists
  - Firebase data is permanent
  - Both restore when you reopen

✅ **If internet is down**:
  - localStorage keeps working
  - Existing data stays visible
  - New changes fail gracefully
