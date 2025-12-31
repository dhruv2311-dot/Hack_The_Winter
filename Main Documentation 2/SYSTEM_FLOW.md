# System Flow: Smart Emergency Blood Network (SEBN)

This document describes the high-level system workflow of SEBN with comprehensive DFDs and flow diagrams.

---

## Overview: System Context Diagram (Level 0 DFD)

```mermaid
graph TB
    User["Users"]
    SEBN["SEBN Platform"]
    DB[("Database")]
    External["External Systems"]
    
    User -->|Requests & Updates| SEBN
    SEBN -->|Read/Write| DB
    SEBN -->|Data Exchange| External
    
    style SEBN fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style DB fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style User fill:#45b7d1,stroke:#333,stroke-width:2px,color:#fff
    style External fill:#96ceb4,stroke:#333,stroke-width:2px,color:#fff
```

---

## 1. Authority & User Structure

SEBN follows a centralized governance model with organization-level autonomy.

### Role Levels

**Super Admin**
- Controls the SEBN platform
- Approves or rejects organization registrations
- Has audit and monitoring access across the system

**Organization Admin**
- Created automatically after organization approval
- Manages users and operations within a single organization

**Organization Staff**
- Operate under an organization admin
- Perform day-to-day actions (stock updates, request handling)

### Role Hierarchy Diagram

```mermaid
graph TD
    SA["Super Admin - Platform Control"]
    OA["Organization Admin - Organization Management"]
    OS["Organization Staff - Day-to-Day Operations"]
    
    SA -->|Creates| OA
    OA -->|Manages| OS
    
    style SA fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style OA fill:#ffa500,stroke:#333,stroke-width:2px,color:#fff
    style OS fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
```

---

## 2. Organization Registration & Approval Flow

Before using the system, every organization must be approved.

### Detailed Registration Flow

```mermaid
flowchart LR
    Org["Organization Registration Request"]
    SA["Super Admin Review"]
    Approve{"Approve or Reject?"}
    Active["Organization Activated"]
    OA["Organization Admin Account Created"]
    Staff["Staff Users Can be Added"]
    Reject["Request Rejected"]
    
    Org --> SA
    SA --> Approve
    Approve -->|Approve| Active
    Approve -->|Reject| Reject
    Active --> OA
    OA --> Staff
    
    style Org fill:#2196f3,stroke:#333,stroke-width:2px
    style SA fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style Approve fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style Active fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style Reject fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style OA fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Staff fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
```

---

## 3. Emergency Blood Request Flow (Core Process)

This is the most critical operational workflow of SEBN.

### Complete Emergency Request DFD

```mermaid
graph TB
    Hospital["Hospital"]
    ReqForm["Blood Request<br/>Type, Quantity, Urgency"]
    ReqDB[("Request Database")]
    Search["Search Engine<br/>Radius-Based"]
    BBStock[("Blood Bank Stock Database")]
    
    Check{"Blood Found?"}
    Expand["Expand Search Radius"]
    
    NGOCheck{"Still Not Found?"}
    NGOFallback["NGO Fallback<br/>Donor List"]
    NGODb[("NGO Donor Database")]
    
    Result["Return Results<br/>Available Options"]
    AuditLog[("Audit Log Database")]
    Notification["Send to Hospital"]
    
    Hospital -->|Creates| ReqForm
    ReqForm -->|Store| ReqDB
    ReqForm -->|Trigger| Search
    
    Search -->|Query| BBStock
    BBStock -->|Check| Check
    
    Check -->|Yes| Result
    Check -->|No| Expand
    
    Expand -->|Re-search| BBStock
    Check -->|Still No| NGOCheck
    NGOCheck -->|Yes| NGOFallback
    NGOFallback -->|Query| NGODb
    NGODb -->|Donor List| Result
    NGOCheck -->|No| Result
    
    Result -->|Log| AuditLog
    Result -->|Notify| Notification
    
    style Hospital fill:#ff9800,stroke:#333,stroke-width:2px,color:#fff
    style ReqForm fill:#ff9800,stroke:#333,stroke-width:2px
    style ReqDB fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style Search fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style BBStock fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style Check fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style Expand fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style NGOCheck fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style NGOFallback fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
    style NGODb fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style Result fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style AuditLog fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style Notification fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
```

### Emergency Request Decision Tree

```mermaid
flowchart TD
    H["Hospital Staff<br/>Raises Request"]
    B["Search Blood Banks<br/>Default Radius"]
    B1{"Blood Available?"}
    R1["FOUND<br/>Send Result"]
    E["Expand Radius"]
    B2{"Blood Still Available?"}
    R2["FOUND at Expanded Location"]
    N["Contact NGOs<br/>Donor Fallback"]
    B3{"Donors Available?"}
    R3["FOUND from NGO Network"]
    R4["NO OPTIONS<br/>Escalation"]
    L["Log to Audit"]
    
    H --> B
    B --> B1
    B1 -->|YES| R1
    B1 -->|NO| E
    E --> B2
    B2 -->|YES| R2
    B2 -->|NO| N
    N --> B3
    B3 -->|YES| R3
    B3 -->|NO| R4
    
    R1 --> L
    R2 --> L
    R3 --> L
    R4 --> L
    
    style H fill:#ff9800,stroke:#333,stroke-width:2px,color:#fff
    style B fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style B1 fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style E fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style B2 fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style N fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
    style B3 fill:#ffc107,stroke:#333,stroke-width:2px,color:#000
    style R1 fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style R2 fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style R3 fill:#8bc34a,stroke:#333,stroke-width:2px,color:#fff
    style R4 fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style L fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```

---

## 4. Blood Bank Operations Flow

Blood banks are the primary source of blood availability in the system.

### Blood Bank Data Flow Diagram

```mermaid
graph TB
    BB["Blood Bank Staff"]
    StockUpdate["Stock Update Form<br/>Blood Type, Quantity"]
    StockDB[("Blood Stock Database")]
    
    SystemSearch["SEBN Search<br/>Emergency Request"]
    Query["Query Stock<br/>Availability"]
    Response["Return Stock Data to SEBN"]
    
    Request["Fulfillment Request"]
    Fulfill["Blood Released to Hospital"]
    UpdateLog["Log Transaction<br/>Stock Deduction"]
    
    BB -->|Maintains| StockUpdate
    StockUpdate -->|Store/Update| StockDB
    
    SystemSearch -->|Query| Query
    Query -->|Check| StockDB
    StockDB -->|Return Data| Response
    Response -->|Available| Request
    
    Request -->|Process| Fulfill
    Fulfill -->|Record| UpdateLog
    UpdateLog -->|Update| StockDB
    
    style BB fill:#ff9800,stroke:#333,stroke-width:2px,color:#fff
    style StockUpdate fill:#ff9800,stroke:#333,stroke-width:2px
    style StockDB fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style SystemSearch fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Query fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Response fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style Request fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style Fulfill fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style UpdateLog fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```

---

## 5. NGO Support & Donor Fallback Flow

NGOs provide secondary support through donor networks during critical blood shortages.

### NGO Donor Fallback DFD

```mermaid
graph TB
    NGO["NGO Coordinator"]
    Camp["Donor Camp<br/>Location, Date, Donor List"]
    DonorDB[("NGO Donor Database")]
    
    Escalation["Escalation Signal<br/>Blood Unavailable from Blood Banks"]
    
    Search["Search Donors<br/>Near Emergency Location"]
    Query["Query Available<br/>Donors by Location"]
    List["Donor Contact<br/>List & Details"]
    
    Contact["Contact Donors<br/>Emergency Appeal"]
    Volunteer["Donors Respond<br/>Willing to Help"]
    
    Collection["Organize Collection<br/>Setup & Process"]
    Deliver["Deliver Blood to Hospital"]
    Record["Log Donation<br/>Update Donor Status"]
    
    NGO -->|Manages| Camp
    Camp -->|Store| DonorDB
    
    Escalation -->|Trigger| Search
    Search -->|Query| Query
    Query -->|Check| DonorDB
    DonorDB -->|Return| List
    
    List -->|Execute| Contact
    Contact -->|Response| Volunteer
    Volunteer -->|Process| Collection
    Collection -->|Deliver| Deliver
    Deliver -->|Record| Record
    Record -->|Update| DonorDB
    
    style NGO fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
    style Camp fill:#9c27b0,stroke:#333,stroke-width:2px,color:#fff
    style DonorDB fill:#4ecdc4,stroke:#333,stroke-width:2px,color:#fff
    style Escalation fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
    style Search fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Query fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style List fill:#2196f3,stroke:#333,stroke-width:2px,color:#fff
    style Contact fill:#ff6b6b,stroke:#333,stroke-width:2px,color:#fff
    style Volunteer fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style Collection fill:#8bc34a,stroke:#333,stroke-width:2px,color:#fff
    style Deliver fill:#4caf50,stroke:#333,stroke-width:2px,color:#fff
    style Record fill:#f44336,stroke:#333,stroke-width:2px,color:#fff
```

---

## 6. Complete System Data Flow

```mermaid
graph TB
    subgraph Users["Users/Actors"]
        H["Hospital"]
        BB["Blood Bank"]
        NGO["NGO"]
        SA["Super Admin"]
    end
    
    subgraph Platform["SEBN Platform"]
        API["API Layer"]
        Auth["Authentication"]
        Search["Search Engine"]
        Escalation["Escalation Logic"]
        Notification["Notification"]
        Audit["Audit System"]
    end
    
    subgraph Database["Databases"]
        ReqDB["Request DB"]
        StockDB["Stock DB"]
        DonorDB["Donor DB"]
        OrgDB["Organization DB"]
        AuditDB["Audit DB"]
    end
    
    H -->|Requests| API
    BB -->|Updates| API
    NGO -->|Info| API
    SA -->|Actions| API
    
    API -->|Validate| Auth
    Auth -->|Route| Search
    Auth -->|Route| Escalation
    Auth -->|Route| Notification
    Auth -->|Route| Audit
    
    Search -->|Query| StockDB
    Search -->|Query| DonorDB
    
    Escalation -->|Expand| Search
    
    API -->|Store| ReqDB
    API -->|Store| StockDB
    API -->|Store| DonorDB
    API -->|Store| OrgDB
    
    Search -->|Log| AuditDB
    Escalation -->|Log| AuditDB
    Audit -->|Query| AuditDB
    
    Notification -->|Alert| H
    Notification -->|Alert| BB
    Notification -->|Alert| NGO
    
    Audit -->|Report| SA
    
    style Users fill:#1a4d7a,stroke:#000,stroke-width:3px,color:#fff
    style Platform fill:#4a2859,stroke:#000,stroke-width:3px,color:#fff
    style Database fill:#2d5a3d,stroke:#000,stroke-width:3px,color:#fff
    style H fill:#ff9800,stroke:#000,stroke-width:2px,color:#fff
    style BB fill:#ff9800,stroke:#000,stroke-width:2px,color:#fff
    style NGO fill:#9c27b0,stroke:#000,stroke-width:2px,color:#fff
    style SA fill:#f44336,stroke:#000,stroke-width:2px,color:#fff
    style API fill:#2196f3,stroke:#000,stroke-width:2px,color:#fff
    style Auth fill:#2196f3,stroke:#000,stroke-width:2px,color:#fff
    style Search fill:#2196f3,stroke:#000,stroke-width:2px,color:#fff
    style Escalation fill:#ff6b6b,stroke:#000,stroke-width:2px,color:#fff
    style Notification fill:#9c27b0,stroke:#000,stroke-width:2px,color:#fff
    style Audit fill:#f44336,stroke:#000,stroke-width:2px,color:#fff
    style ReqDB fill:#00bcd4,stroke:#000,stroke-width:2px,color:#fff
    style StockDB fill:#00bcd4,stroke:#000,stroke-width:2px,color:#fff
    style DonorDB fill:#00bcd4,stroke:#000,stroke-width:2px,color:#fff
    style OrgDB fill:#00bcd4,stroke:#000,stroke-width:2px,color:#fff
    style AuditDB fill:#d32f2f,stroke:#000,stroke-width:2px,color:#fff
```

---

## 7. Request Processing Sequence Diagram

```mermaid
sequenceDiagram
    participant H as Hospital Staff
    participant API as SEBN API
    participant Auth as Auth Service
    participant Search as Search Engine
    participant BB as Blood Bank DB
    participant NGO as NGO DB
    participant Audit as Audit System
    
    H->>API: Submit Blood Request
    API->>Auth: Validate User & Org
    Auth-->>API: Authorized
    API->>Search: Search Trigger
    Search->>BB: Query Blood Bank Stock
    BB-->>Search: Stock Results
    
    alt Blood Found
        Search-->>API: Results Ready
    else Blood Not Found
        Search->>Search: Expand Radius
        Search->>BB: Re-query
        Search->>NGO: Query NGO Donors
        NGO-->>Search: Donor List
    end
    
    Search->>Audit: Log Request Activity
    Search-->>API: Return Results
    API->>H: Deliver Results
```

---

## 8. Summary

SEBN uses a **sophisticated yet governed workflow** to coordinate blood availability:

### Key Features

- **Governed Access**: Super Admin controls all approvals  
- **Real-time Search**: Intelligent blood bank queries  
- **Automatic Escalation**: Progressive radius expansion  
- **NGO Fallback**: Secondary donor network activation  
- **Complete Audit Trail**: Every action logged  
- **Multi-stakeholder Coordination**: Hospital, Blood Bank, NGO, Admin  
- **Scalable Architecture**: Supports multiple organizations

### Core Workflow

1. **Request**: Hospital submits blood request
2. **Search**: System queries nearby blood banks
3. **Escalate**: If not found, expand radius
4. **Fallback**: If still unavailable, contact NGO donors
5. **Deliver**: Return results to hospital
6. **Audit**: Log all actions for compliance

The system balances **simplicity** with **sophistication**, ensuring efficient emergency blood distribution across a governed, multi-organization healthcare ecosystem.
