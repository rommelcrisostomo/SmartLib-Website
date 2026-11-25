SMARTLIB— LIBRARY MANAGEMENT SYSTEM PROTOTYPE

Project Title   : SmartLib Library Management Sytem
System Type     : Front-End System Prototype (HTML, CSS, JavaScript)


1. SYSTEM OVERVIEW

SmartLib is a responsive, multi-page front-end library circulation prototype
designed to streamline book discovery, borrowing requests, receipt generation,
and borrower record management. Built with HTML, modern CSS, and
JavaScript, the system provides a complete end-to-end borrowing
workflow without requiring a server-side backend or external database.

All catalog inventory and borrowing transactions are persisted locally in the
user's browser via localStorage, ensuring seamless data retention across page
navigations and browser refreshes.


2. KEY FEATURES & ENFORCED BUSINESS RULES

A. Six-Page Architecture:

   - Dashboard (index.html)      : Live KPI summary cards (Catalog Titles,
                                   Copies on Shelf, Active Borrows, Returned
                                   Books) and 3-step workflow overview.

   - Book Catalog (catalog.html) : Interactive library bookshelves with
                                   real-time keyword search, category filter,
                                   and availability status filter.

   - Borrow Book (borrow.html)   : Validated borrowing request form with live
                                   selected book cover preview and unsaved-form
                                   navigation guard.

   - Receipt (receipt.html)      : Official digital checkout confirmation slip
                                   with quick-switch dropdown and print support.

   - Records (records.html)      : Full transaction table with search/status
                                   filters, Edit Borrower Info modal (with
                                   instant auto-updating rows), direct Print
                                   Receipt button, Return/Extend/Cancel/Delete
                                   actions, and JSON Export/Import tools.

   - About & Help (about.html)   : User instructions, enforced library rules,
                                   and prototype scope notes.

B. Input Validations & Library Business Rules:

   - Multi-Word Full Name        : Rejects single-word names, numbers, symbols,
                                   and placeholder words; requires first and
                                   last name separated by a space.

   - Verified Email Providers    : Validates email format and restricts domains
                                   to genuine providers (@gmail.com, @yahoo.com,
                                   @yahoo.com.ph, @outlook.com, @hotmail.com,
                                   @icloud.com, or .edu / .edu.ph / .gov.ph).

   - ID Format Enforcement       : Requires Student/Library ID in YYYY-XXXX
                                   format (e.g., 2026-1042).

   - Loan Window Rules           : Rejects past borrow dates and enforces a
                                   1-to-14 calendar day borrowing period.

   - Real-Time Inventory & Caps  : Blocks out-of-stock books, prevents duplicate
                                   active borrows of the same title by one ID,
                                   and enforces a maximum of 3 active loans per
                                   borrower ID.

   - Automatic Stock Sync        : Borrowing decrements available copies;
                                   returning or cancelling restores stock.

   - Customized Print Slip       : Generates a formatted, print-ready
                                   SmartLib Official Circulation Slip.


3. FOLDER & FILE STRUCTURE

1-3_Merced_SmartLib/
├── index.html                   Home / Dashboard & Live KPIs
├── catalog.html                 Library Bookshelves & Catalog Filters
├── borrow.html                  Validated Borrow Transaction Form
├── receipt.html                 Confirmation & Printable Receipt Summary
├── records.html                 Records Management, Edit Modal & JSON Tools
├── about.html                   About, User Guide & Scope Documentation
├── README.txt  		 System Documentation (this file)
├── SmartLib_User_Guide.pdf      Step-by-step user manual with screenshots          
├── CSS/
│   └── styles.css               Global theme, responsive grids, modal & print CSS
├── JavaScript/
│   ├── data.js                  Sample book catalog & initial seed records
│   ├── storage.js               Defensive localStorage CRUD & JSON export
│   ├── validation.js            Full-name, email, date & business rule checks
│   └── app.js                   Page controllers, edit modal & PrintReceiptService
├── Data/
│   └── books.json               Standalone JSON catalog dataset
└── Assets/
    └── Images/
        ├── book-101.svg         Custom vector cover 1
        ├── book-102.svg         Custom vector cover 2
        ├── book-103.svg         Custom vector cover 3
        ├── book-104.svg         Custom vector cover 4
        ├── book-105.svg         Custom vector cover 5
        └── book-106.svg         Custom vector cover 6
      
  

4. SETUP & RUNNING INSTRUCTIONS

Option 1 — Direct Browser Launch
  1. Extract the ZIP archive (1-3_Merced_SmartLib.zip) to any folder.
  2. Double-click `index.html` to open it in Google Chrome, Microsoft Edge,
     Mozilla Firefox, or Apple Safari.
  3. On initial load, the system automatically seeds sample books and records
     into localStorage.

Option 2 — Live Deployment URL
  1. Open your browser on your mobile phone/tablet/desktop computer.
  2. Type https://smartlib-merced.vercel.app/ in the URL to access the system.
  3. No login or server setup is required; sample catalog titles and demonstration records
  load automatically

Resetting Demo Data:
  - Navigate to `records.html` and click "Reset Sample Data" at the top right
    to restore the original 6 books and 3 sample borrowing records.


5. DEPENDENCIES & BROWSER COMPATIBILITY

- Runtime Dependencies : None (100% HTML, CSS, and JavaScript;
                       no Node.js, npm, or database installation required).

- Supported Browsers   : Google Chrome, Microsoft Edge, Mozilla
                       Firefox, Safari (Desktop, Tablet, and Mobile).


6. PROTOTYPE SCOPE & LIMITATIONS

1. Client-Side Storage Only: All data is stored inside the user's local browser. 
   Clearing browser site data resets storage,and records do not sync automatically 
   across different browsers or devices unless transferred via the Export/Import JSON 
   feature.

2. Simulated External Integrations: Institutional Student/Library ID lookups are simulated
   in the user interface and receipt summaries for prototype demonstration.

3. Single-Role Front-End View: Authentication and role-based login permissions
   (separate admin vs. student accounts) are excluded from this front-end
   prototype scope.
