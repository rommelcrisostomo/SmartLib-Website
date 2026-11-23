/**
 * js/app.js
 * Complete application controller for LibriBloom:
 * - Shared mobile navigation & cute page-turning transition loader
 * - Unfinished borrow form confirmation guard
 * - Customized official print receipt generator (PrintReceiptService)
 * - Dashboard live KPI summary (index.html)
 * - 3D Library Bookshelf grouping & filtering (catalog.html)
 * - Validated Borrow Form with strict full-name & email checks (borrow.html)
 * - Printable Receipt Summary with book cover & stamp (receipt.html)
 * - Records Management with instant auto-updating Edit Borrower modal (records.html)
 */

window.hasUnsavedBorrowForm = false;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function navigateWithLoader(url, label = "Turning the page...") {
  const loader = document.getElementById("page-loader");
  const loaderText = document.getElementById("loader-text");
  if (!loader) {
    window.location.href = url;
    return;
  }
  if (loaderText) {
    loaderText.textContent = label;
  }
  loader.classList.add("active");
  setTimeout(() => {
    window.location.href = url;
  }, 460);
}

window.addEventListener("pageshow", () => {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.classList.remove("active");
  }
});

window.addEventListener("beforeunload", (e) => {
  if (window.hasUnsavedBorrowForm) {
    e.preventDefault();
    e.returnValue = "";
  }
});

/* ==========================================================================
   CUSTOMIZED PRINT RECEIPT GENERATOR (Shared by records.html & receipt.html)
   ========================================================================== */
const PrintReceiptService = {
  print(record, books) {
    if (!record) return;

    let container = document.getElementById("print-slip-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "print-slip-container";
      container.setAttribute("aria-hidden", "true");
      document.body.appendChild(container);
    }

    const matchedBook = books.find((b) => b.id === record.bookId);
    const coverSrc = escapeHtml(matchedBook?.coverImage || "Assets/Images/book-101.png");
    const authorName = escapeHtml(matchedBook?.author || "LibriBloom Collection");
    const categoryName = escapeHtml(matchedBook?.category || "Library Shelf");
    const loanDays = calculateDaysBetween(record.borrowDate, record.dueDate);
    const printedAt = new Date().toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });

    container.innerHTML = `
      <div class="print-slip">
        <div class="print-header">
          <div class="print-brand">
            <div class="print-brand-badge">&#9829;</div>
            <div>
              <h1 class="print-brand-title">LibriBloom</h1>
              <p class="print-brand-sub">Curated Boutique Library Studio</p>
            </div>
          </div>
          <div class="print-doc-meta">
            <span class="print-doc-type">Official Circulation Slip</span>
            <span class="print-timestamp">Printed: ${escapeHtml(printedAt)}</span>
          </div>
        </div>

        <div class="print-ref-bar">
          <div>
            <span class="print-ref-label">Transaction Reference No.</span>
            <span class="print-ref-code">${escapeHtml(record.refNumber)}</span>
          </div>
          <div class="print-barcode"></div>
          <span class="print-status-pill">${escapeHtml(record.status)}</span>
        </div>

        <div class="print-book-box">
          <img src="${coverSrc}" alt="" class="print-book-cover" />
          <div>
            <span class="print-book-category">${categoryName}</span>
            <h2 class="print-book-title">${escapeHtml(record.bookTitle)}</h2>
            <p class="print-book-sub">Author: ${authorName} &bull; ISBN: ${escapeHtml(record.bookIsbn)}</p>
          </div>
        </div>

        <div class="print-details-grid">
          <div>
            <span class="print-field-label">Borrower Full Name</span>
            <span class="print-field-value">${escapeHtml(record.borrowerName)}</span>
          </div>
          <div>
            <span class="print-field-label">Student / Library ID</span>
            <span class="print-field-value">${escapeHtml(record.borrowerId)}</span>
          </div>
          <div>
            <span class="print-field-label">Email Address (Simulated Alert)</span>
            <span class="print-field-value">${escapeHtml(record.borrowerEmail)}</span>
          </div>
          <div>
            <span class="print-field-label">Loan Duration</span>
            <span class="print-field-value">${loanDays} Calendar Day${loanDays === 1 ? "" : "s"}</span>
          </div>
          <div>
            <span class="print-field-label">Borrow Date</span>
            <span class="print-field-value">${escapeHtml(record.borrowDate)}</span>
          </div>
          <div>
            <span class="print-field-label">Return Due Date</span>
            <span class="print-field-value">${escapeHtml(record.dueDate)}</span>
          </div>
          <div class="print-full-width">
            <span class="print-field-label">Purpose / Remarks</span>
            <span class="print-field-value">${escapeHtml(record.notes || "Standard library borrowing")}</span>
          </div>
        </div>

        <div class="print-terms">
          <strong>Circulation Policy &amp; Prototype Notice:</strong> Books must be returned on or before the stated due date (14-day maximum loan period). This receipt is generated by the LibriBloom Front-End System Prototype using browser-local storage.
        </div>

        <div class="print-signoff">
          <div class="print-sig-block">
            <div class="print-sig-line"></div>
            <span class="print-sig-label">Borrower Signature (${escapeHtml(record.borrowerName)})</span>
          </div>
          <div class="print-official-stamp">
            LIBRIBLOOM<br/>VERIFIED<br/>&#9829; 2026
          </div>
          <div class="print-sig-block">
            <div class="print-sig-line"></div>
            <span class="print-sig-label">Librarian / Circulation Desk</span>
          </div>
        </div>

        <div class="print-footer-note">
          Thank you for reading with LibriBloom &bull; Keep this slip for return verification
        </div>
      </div>
    `;

    setTimeout(() => {
      window.print();
    }, 120);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const toastBanner = document.getElementById("toast-banner");
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const primaryNav = document.getElementById("primary-nav");

  let toastTimeout;
  function showToast(message, type = "success") {
    if (!toastBanner) return;
    toastBanner.textContent = message;
    toastBanner.className = `toast-banner toast-${type}`;
    toastBanner.hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toastBanner.hidden = true;
    }, 4000);
  }

  if (mobileMenuBtn && primaryNav) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = primaryNav.classList.toggle("open");
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest("a.nav-link, a.transition-link");
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || e.ctrlKey || e.metaKey || e.shiftKey) return;

    e.preventDefault();

    if (window.hasUnsavedBorrowForm) {
      const leavePage = window.confirm(
        "You have an unfinished borrow request on this page.\n\nClick OK to disregard your unfinished form and leave, or Cancel to stay and complete it."
      );
      if (!leavePage) {
        return;
      }
      window.hasUnsavedBorrowForm = false;
    }

    if (primaryNav) primaryNav.classList.remove("open");
    const pageName = link.dataset.loaderLabel || `Opening ${link.textContent.trim()}...`;
    navigateWithLoader(href, pageName);
  });

  const currentPage = document.body.dataset.page;
  if (currentPage === "dashboard") initDashboardPage();
  if (currentPage === "catalog") initCatalogPage();
  if (currentPage === "borrow") initBorrowPage(showToast);
  if (currentPage === "receipt") initReceiptPage();
  if (currentPage === "records") initRecordsPage(showToast);
});

/* ==========================================================================
   PAGE 1: DASHBOARD CONTROLLER (index.html)
   ========================================================================== */
function initDashboardPage() {
  const books = StorageService.getBooks();
  const records = StorageService.getRecords();

  const totalBooks = books.length;
  const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
  const activeBorrows = records.filter((r) => r.status === "Borrowed").length;
  const returnedBooks = records.filter((r) => r.status === "Returned").length;

  document.getElementById("stat-total-books").textContent = totalBooks;
  document.getElementById("stat-available-copies").textContent = availableCopies;
  document.getElementById("stat-active-borrows").textContent = activeBorrows;
  document.getElementById("stat-returned-books").textContent = returnedBooks;
}

/* ==========================================================================
   PAGE 2: LIBRARY BOOKSHELF CATALOG CONTROLLER (catalog.html)
   ========================================================================== */
function initCatalogPage() {
  const books = StorageService.getBooks();
  const catalogSearch = document.getElementById("catalog-search");
  const catalogCategory = document.getElementById("catalog-category");
  const catalogStatus = document.getElementById("catalog-status");
  const catalogGrid = document.getElementById("catalog-grid");
  const catalogEmpty = document.getElementById("catalog-empty");

  catalogGrid.classList.remove("catalog-grid");

  function renderCatalog() {
    const query = catalogSearch.value.trim().toLowerCase();
    const category = catalogCategory.value;
    const status = catalogStatus.value;

    const filtered = books.filter((book) => {
      const matchesQuery =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query);
      const matchesCategory = category === "ALL" || book.category === category;
      const matchesStatus =
        status === "ALL" ||
        (status === "AVAILABLE" && book.availableCopies > 0) ||
        (status === "OUT" && book.availableCopies === 0);
      return matchesQuery && matchesCategory && matchesStatus;
    });

    catalogGrid.innerHTML = "";
    if (filtered.length === 0) {
      catalogEmpty.hidden = false;
      return;
    }
    catalogEmpty.hidden = true;

    const booksPerShelf = 3;
    for (let i = 0; i < filtered.length; i += booksPerShelf) {
      const shelfBooks = filtered.slice(i, i + booksPerShelf);
      const shelfNumber = Math.floor(i / booksPerShelf) + 1;

      const shelfUnit = document.createElement("div");
      shelfUnit.className = "shelf-unit";

      const rowHtml = shelfBooks
        .map((book, idx) => {
          const isAvailable = book.availableCopies > 0;
          const coverSrc = escapeHtml(book.coverImage || "Assets/Images/book-101.svg");
          return `
            <article class="shelf-book-slot" style="animation-delay: ${(i + idx) * 0.06}s;">
              <div
                class="book-3d-wrap"
                data-book-id="${escapeHtml(book.id)}"
                data-available="${isAvailable}"
                title="${isAvailable ? `Click to borrow ${escapeHtml(book.title)}` : "Currently out of stock"}"
              >
                <span class="status-badge book-floating-badge ${isAvailable ? "status-available" : "status-out"}">
                  ${isAvailable ? "Available" : "Out of Stock"}
                </span>
                <img
                  src="${coverSrc}"
                  alt="Book cover of ${escapeHtml(book.title)}"
                  class="book-cover-img"
                  loading="lazy"
                />
              </div>
              <div class="book-plaque">
                <div>
                  <span class="category-tag">${escapeHtml(book.category)}</span>
                  <h2 class="book-title">${escapeHtml(book.title)}</h2>
                  <p class="book-author">By ${escapeHtml(book.author)}</p>
                  <p class="book-isbn">ISBN: ${escapeHtml(book.isbn)}</p>
                </div>
                <div class="book-footer">
                  <span class="copies-text">${book.availableCopies}/${book.totalCopies} left</span>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm select-book-btn"
                    data-book-id="${escapeHtml(book.id)}"
                    ${!isAvailable ? "disabled" : ""}
                  >
                    ${isAvailable ? "Borrow Book" : "Unavailable"}
                  </button>
                </div>
              </div>
            </article>
          `;
        })
        .join("");

      shelfUnit.innerHTML = `
        <span class="shelf-label-tag">Shelf 0${shelfNumber}</span>
        <div class="shelf-books-row">${rowHtml}</div>
        <div class="shelf-plank" aria-hidden="true"></div>
      `;
      catalogGrid.appendChild(shelfUnit);
    }
  }

  catalogSearch.addEventListener("input", renderCatalog);
  catalogCategory.addEventListener("change", renderCatalog);
  catalogStatus.addEventListener("change", renderCatalog);

  catalogGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".select-book-btn");
    if (btn) {
      const bookId = encodeURIComponent(btn.dataset.bookId);
      navigateWithLoader(`borrow.html?bookId=${bookId}`, "Pulling book from the shelf...");
      return;
    }

    const coverWrap = e.target.closest(".book-3d-wrap");
    if (coverWrap && coverWrap.dataset.available === "true") {
      const bookId = encodeURIComponent(coverWrap.dataset.bookId);
      navigateWithLoader(`borrow.html?bookId=${bookId}`, "Pulling book from the shelf...");
    }
  });

  renderCatalog();
}

/* ==========================================================================
   PAGE 3: BORROW TRANSACTION FORM CONTROLLER (borrow.html)
   ========================================================================== */
function initBorrowPage(showToast) {
  const books = StorageService.getBooks();
  const records = StorageService.getRecords();

  const borrowForm = document.getElementById("borrow-form");
  const bookSelect = document.getElementById("book-select");
  const borrowerNameInput = document.getElementById("borrower-name");
  const borrowerIdInput = document.getElementById("borrower-id");
  const borrowerEmailInput = document.getElementById("borrower-email");
  const borrowDateInput = document.getElementById("borrow-date");
  const dueDateInput = document.getElementById("due-date");
  const borrowNotesInput = document.getElementById("borrow-notes");
  const formFeedback = document.getElementById("form-feedback");
  const resetFormBtn = document.getElementById("reset-form-btn");

  const previewBox = document.getElementById("selected-book-preview");
  const previewImg = document.getElementById("preview-book-cover");
  const previewTitle = document.getElementById("preview-book-title");
  const previewMeta = document.getElementById("preview-book-meta");

  books.forEach((book) => {
    const opt = document.createElement("option");
    opt.value = book.id;
    opt.disabled = book.availableCopies <= 0;
    opt.textContent = `${book.title} (${book.availableCopies} of ${book.totalCopies} available)`;
    bookSelect.appendChild(opt);
  });

  const params = new URLSearchParams(window.location.search);
  const preselectedId = params.get("bookId");
  if (preselectedId) {
    const targetBook = books.find((b) => b.id === preselectedId && b.availableCopies > 0);
    if (targetBook) {
      bookSelect.value = targetBook.id;
    }
  }

  function updateSelectedBookPreview() {
    if (!previewBox) return;
    const chosen = books.find((b) => b.id === bookSelect.value);
    if (!chosen) {
      previewBox.hidden = true;
      return;
    }
    previewImg.src = chosen.coverImage || "Assets/Images/book-101.svg";
    previewImg.alt = `Cover of ${chosen.title}`;
    previewTitle.textContent = chosen.title;
    previewMeta.textContent = `${chosen.author} • ${chosen.availableCopies} of ${chosen.totalCopies} available`;
    previewBox.hidden = false;
  }

  function setDefaultDates() {
    const today = getTodayLocalISO();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueDefault = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, "0")}-${String(nextWeek.getDate()).padStart(2, "0")}`;

    borrowDateInput.min = today;
    borrowDateInput.value = today;
    dueDateInput.min = today;
    dueDateInput.value = dueDefault;
  }

  setDefaultDates();
  updateSelectedBookPreview();

  const initialFormSnapshot = {
    bookId: bookSelect.value,
    borrowerName: "",
    borrowerId: "",
    borrowerEmail: "",
    borrowDate: borrowDateInput.value,
    dueDate: dueDateInput.value,
    notes: ""
  };

  function syncDirtyFormState() {
    const isModified =
      bookSelect.value !== initialFormSnapshot.bookId ||
      borrowerNameInput.value.trim() !== "" ||
      borrowerIdInput.value.trim() !== "" ||
      borrowerEmailInput.value.trim() !== "" ||
      borrowDateInput.value !== initialFormSnapshot.borrowDate ||
      dueDateInput.value !== initialFormSnapshot.dueDate ||
      borrowNotesInput.value.trim() !== "";

    window.hasUnsavedBorrowForm = isModified;
  }

  borrowForm.addEventListener("input", syncDirtyFormState);
  borrowForm.addEventListener("change", syncDirtyFormState);

  // Live Full Name Validation on Blur (Rejects single-word names immediately)
  borrowerNameInput.addEventListener("blur", () => {
    const nameVal = borrowerNameInput.value.trim();
    const errSpan = document.getElementById("err-borrower-name");
    if (!nameVal) {
      borrowerNameInput.classList.remove("invalid");
      errSpan.textContent = "";
      return;
    }
    const nameMsg = validateFullName(nameVal);
    if (nameMsg) {
      borrowerNameInput.classList.add("invalid");
      errSpan.textContent = nameMsg;
    } else {
      borrowerNameInput.classList.remove("invalid");
      errSpan.textContent = "";
    }
  });

  // Live Email Validation on Blur
  borrowerEmailInput.addEventListener("blur", () => {
    const emailVal = borrowerEmailInput.value.trim();
    const errSpan = document.getElementById("err-borrower-email");
    if (!emailVal) {
      borrowerEmailInput.classList.remove("invalid");
      errSpan.textContent = "";
      return;
    }
    const emailMsg = validateGenuineEmail(emailVal);
    if (emailMsg) {
      borrowerEmailInput.classList.add("invalid");
      errSpan.textContent = emailMsg;
    } else {
      borrowerEmailInput.classList.remove("invalid");
      errSpan.textContent = "";
    }
  });

  function clearValidationUI() {
    formFeedback.hidden = true;
    formFeedback.textContent = "";
    const errorMap = [
      ["book-select", "err-book-select"],
      ["borrower-name", "err-borrower-name"],
      ["borrower-id", "err-borrower-id"],
      ["borrower-email", "err-borrower-email"],
      ["borrow-date", "err-borrow-date"],
      ["due-date", "err-due-date"]
    ];
    errorMap.forEach(([inputId, errId]) => {
      document.getElementById(inputId).classList.remove("invalid");
      document.getElementById(errId).textContent = "";
    });
  }

  function displayValidationErrors(fieldErrors, ruleError) {
    clearValidationUI();
    const fieldToElement = {
      bookId: ["book-select", "err-book-select"],
      borrowerName: ["borrower-name", "err-borrower-name"],
      borrowerId: ["borrower-id", "err-borrower-id"],
      borrowerEmail: ["borrower-email", "err-borrower-email"],
      borrowDate: ["borrow-date", "err-borrow-date"],
      dueDate: ["due-date", "err-due-date"]
    };

    Object.entries(fieldErrors).forEach(([key, msg]) => {
      if (fieldToElement[key]) {
        const [inputId, errId] = fieldToElement[key];
        document.getElementById(inputId).classList.add("invalid");
        document.getElementById(errId).textContent = msg;
      }
    });

    if (ruleError) {
      formFeedback.textContent = ruleError;
      formFeedback.hidden = false;
    } else if (Object.keys(fieldErrors).length > 0) {
      formFeedback.textContent = "Please fix the highlighted fields before confirming your borrow request.";
      formFeedback.hidden = false;
    }
  }

  bookSelect.addEventListener("change", updateSelectedBookPreview);

  borrowForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = {
      bookId: bookSelect.value,
      borrowerName: borrowerNameInput.value,
      borrowerId: borrowerIdInput.value,
      borrowerEmail: borrowerEmailInput.value,
      borrowDate: borrowDateInput.value,
      dueDate: dueDateInput.value,
      notes: borrowNotesInput.value.trim()
    };

    const { isValid, fieldErrors, ruleError, selectedBook, normalizedName } =
      ValidationService.validateBorrowRequest(formData, books, records);

    if (!isValid) {
      displayValidationErrors(fieldErrors, ruleError);
      showToast("Please check the highlighted validation errors.", "error");
      return;
    }

    clearValidationUI();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const refNumber = `LIB-${new Date().getFullYear()}-${randomSuffix}`;

    const newRecord = {
      refNumber,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookIsbn: selectedBook.isbn,
      borrowerName: normalizedName,
      borrowerId: formData.borrowerId.trim(),
      borrowerEmail: formData.borrowerEmail.trim(),
      borrowDate: formData.borrowDate,
      dueDate: formData.dueDate,
      notes: formData.notes,
      status: "Borrowed",
      createdAt: new Date().toISOString()
    };

    selectedBook.availableCopies = Math.max(0, selectedBook.availableCopies - 1);
    records.unshift(newRecord);

    StorageService.saveBooks(books);
    StorageService.saveRecords(records);
    StorageService.setLastReceipt(refNumber);

    window.hasUnsavedBorrowForm = false;

    navigateWithLoader(
      `receipt.html?ref=${encodeURIComponent(refNumber)}`,
      `Generating receipt ${refNumber}...`
    );
  });

  resetFormBtn.addEventListener("click", () => {
    clearValidationUI();
    window.hasUnsavedBorrowForm = false;
    setTimeout(() => {
      setDefaultDates();
      initialFormSnapshot.bookId = "";
      initialFormSnapshot.borrowDate = borrowDateInput.value;
      initialFormSnapshot.dueDate = dueDateInput.value;
      updateSelectedBookPreview();
    }, 0);
  });
}

/* ==========================================================================
   PAGE 4: RECEIPT SUMMARY CONTROLLER (receipt.html)
   ========================================================================== */
function initReceiptPage() {
  const books = StorageService.getBooks();
  const records = StorageService.getRecords();
  const receiptSelect = document.getElementById("receipt-switcher");
  const receiptEmpty = document.getElementById("receipt-empty");
  const receiptCard = document.getElementById("receipt-card");
  const printReceiptBtn = document.getElementById("print-receipt-btn");

  const params = new URLSearchParams(window.location.search);
  const queryRef = params.get("ref");
  const initialRef = queryRef || StorageService.getLastReceipt() || (records[0]?.refNumber ?? "");

  records.forEach((rec) => {
    const opt = document.createElement("option");
    opt.value = rec.refNumber;
    opt.textContent = `${rec.refNumber} — ${rec.bookTitle} (${rec.borrowerName})`;
    receiptSelect.appendChild(opt);
  });

  function renderReceipt(refNumber) {
    const record = records.find((r) => r.refNumber === refNumber);
    if (!record) {
      receiptEmpty.hidden = false;
      receiptCard.hidden = true;
      return;
    }

    StorageService.setLastReceipt(record.refNumber);
    receiptSelect.value = record.refNumber;
    receiptEmpty.hidden = true;
    receiptCard.hidden = false;

    const matchedBook = books.find((b) => b.id === record.bookId);
    const receiptCover = document.getElementById("rec-book-cover");
    if (receiptCover) {
      receiptCover.src = matchedBook?.coverImage || "Assets/Images/book-101.svg";
      receiptCover.alt = `Cover of ${record.bookTitle}`;
    }

    const days = calculateDaysBetween(record.borrowDate, record.dueDate);
    document.getElementById("rec-ref").textContent = record.refNumber;
    document.getElementById("rec-book").textContent = `${record.bookTitle} (${record.bookIsbn})`;
    document.getElementById("rec-borrower").textContent = record.borrowerName;
    document.getElementById("rec-id").textContent = record.borrowerId;
    document.getElementById("rec-email").textContent = record.borrowerEmail;
    document.getElementById("rec-borrow-date").textContent = record.borrowDate;
    document.getElementById("rec-due-date").textContent = `${record.dueDate} (${days} day${days === 1 ? "" : "s"})`;
    document.getElementById("rec-notes").textContent = record.notes || "None";

    const statusBadge = document.getElementById("rec-status");
    statusBadge.textContent = record.status;
    statusBadge.className = `status-badge status-${record.status.toLowerCase()}`;
  }

  receiptSelect.addEventListener("change", () => {
    renderReceipt(receiptSelect.value);
  });

  printReceiptBtn.addEventListener("click", () => {
    const currentRecord = records.find((r) => r.refNumber === receiptSelect.value);
    if (currentRecord) {
      PrintReceiptService.print(currentRecord, books);
    }
  });

  renderReceipt(initialRef);
}

/* ==========================================================================
   PAGE 5: RECORDS MANAGEMENT CONTROLLER (records.html)
   ========================================================================== */
function initRecordsPage(showToast) {
  let books = StorageService.getBooks();
  let records = StorageService.getRecords();
  let highlightedRef = "";

  const recordsSearch = document.getElementById("records-search");
  const recordsStatusFilter = document.getElementById("records-status-filter");
  const recordsTbody = document.getElementById("records-tbody");
  const recordsEmpty = document.getElementById("records-empty");
  const exportJsonBtn = document.getElementById("export-json-btn");
  const importJsonInput = document.getElementById("import-json-input");
  const resetDemoBtn = document.getElementById("reset-demo-btn");

  // Edit Borrower Modal Elements
  const editModal = document.getElementById("edit-record-modal");
  const editForm = document.getElementById("edit-record-form");
  const editSummary = document.getElementById("edit-record-summary");
  const editRefInput = document.getElementById("edit-ref-number");
  const editNameInput = document.getElementById("edit-borrower-name");
  const editIdInput = document.getElementById("edit-borrower-id");
  const editEmailInput = document.getElementById("edit-borrower-email");
  const editNotesInput = document.getElementById("edit-borrower-notes");
  const editFeedback = document.getElementById("edit-form-feedback");
  const closeEditModalBtn = document.getElementById("close-edit-modal-btn");
  const cancelEditModalBtn = document.getElementById("cancel-edit-modal-btn");

  function clearEditValidationUI() {
    editFeedback.hidden = true;
    editFeedback.textContent = "";
    [
      ["edit-borrower-name", "err-edit-borrower-name"],
      ["edit-borrower-id", "err-edit-borrower-id"],
      ["edit-borrower-email", "err-edit-borrower-email"]
    ].forEach(([inputId, errId]) => {
      document.getElementById(inputId).classList.remove("invalid");
      document.getElementById(errId).textContent = "";
    });
  }

  function openEditModal(record) {
    clearEditValidationUI();
    editRefInput.value = record.refNumber;
    editSummary.innerHTML = `<strong>${escapeHtml(record.refNumber)}</strong> &bull; ${escapeHtml(record.bookTitle)} (${escapeHtml(record.status)})`;
    editNameInput.value = record.borrowerName;
    editIdInput.value = record.borrowerId;
    editEmailInput.value = record.borrowerEmail;
    editNotesInput.value = record.notes || "";
    editModal.hidden = false;
    editNameInput.focus();
  }

  function closeEditModal() {
    editModal.hidden = true;
    clearEditValidationUI();
  }

  // Real-time blur validation inside Edit Modal
  editNameInput.addEventListener("blur", () => {
    const errSpan = document.getElementById("err-edit-borrower-name");
    const msg = validateFullName(editNameInput.value);
    editNameInput.classList.toggle("invalid", Boolean(msg));
    errSpan.textContent = msg;
  });

  editEmailInput.addEventListener("blur", () => {
    const errSpan = document.getElementById("err-edit-borrower-email");
    const msg = validateGenuineEmail(editEmailInput.value);
    editEmailInput.classList.toggle("invalid", Boolean(msg));
    errSpan.textContent = msg;
  });

  closeEditModalBtn.addEventListener("click", closeEditModal);
  cancelEditModalBtn.addEventListener("click", closeEditModal);

  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) closeEditModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !editModal.hidden) {
      closeEditModal();
    }
  });

  // Save Changes -> Immediately Persist to localStorage & Auto-Update Records Table
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const ref = editRefInput.value;
    const recordIndex = records.findIndex((r) => r.refNumber === ref);
    if (recordIndex === -1) return;
    const currentRecord = records[recordIndex];

    const editData = {
      borrowerName: editNameInput.value,
      borrowerId: editIdInput.value,
      borrowerEmail: editEmailInput.value,
      notes: editNotesInput.value.trim()
    };

    const { isValid, fieldErrors, ruleError, normalizedName } =
      ValidationService.validateBorrowerEdit(editData, currentRecord, records);

    if (!isValid) {
      clearEditValidationUI();
      const fieldMap = {
        borrowerName: ["edit-borrower-name", "err-edit-borrower-name"],
        borrowerId: ["edit-borrower-id", "err-edit-borrower-id"],
        borrowerEmail: ["edit-borrower-email", "err-edit-borrower-email"]
      };
      Object.entries(fieldErrors).forEach(([key, msg]) => {
        if (fieldMap[key]) {
          const [inputId, errId] = fieldMap[key];
          document.getElementById(inputId).classList.add("invalid");
          document.getElementById(errId).textContent = msg;
        }
      });

      editFeedback.textContent =
        ruleError || "Please fix the highlighted borrower details before saving.";
      editFeedback.hidden = false;
      return;
    }

    // Update record in memory and save directly to localStorage
    records[recordIndex] = {
      ...currentRecord,
      borrowerName: normalizedName,
      borrowerId: editData.borrowerId.trim(),
      borrowerEmail: editData.borrowerEmail.trim(),
      notes: editData.notes,
      updatedAt: new Date().toISOString()
    };

    StorageService.saveRecords(records);
    StorageService.setLastReceipt(ref);

    // If an active search filter would hide the newly renamed record, clear search so update is visible
    const activeQuery = recordsSearch.value.trim().toLowerCase();
    if (activeQuery) {
      const updatedRec = records[recordIndex];
      const stillMatches =
        updatedRec.refNumber.toLowerCase().includes(activeQuery) ||
        updatedRec.borrowerName.toLowerCase().includes(activeQuery) ||
        updatedRec.borrowerId.toLowerCase().includes(activeQuery) ||
        updatedRec.bookTitle.toLowerCase().includes(activeQuery);
      if (!stillMatches) {
        recordsSearch.value = "";
      }
    }

    // Close modal, re-render the records table automatically, and highlight updated row
    highlightedRef = ref;
    closeEditModal();
    renderRecords();
    showToast(`Saved! Borrower information updated in table for ${ref}.`);
  });

  function renderRecords() {
    const query = recordsSearch.value.trim().toLowerCase();
    const statusFilter = recordsStatusFilter.value;

    const filtered = records.filter((rec) => {
      const matchesQuery =
        rec.refNumber.toLowerCase().includes(query) ||
        rec.borrowerName.toLowerCase().includes(query) ||
        rec.borrowerId.toLowerCase().includes(query) ||
        rec.bookTitle.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "ALL" || rec.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    recordsTbody.innerHTML = "";
    if (filtered.length === 0) {
      recordsEmpty.hidden = false;
      return;
    }
    recordsEmpty.hidden = true;

    filtered.forEach((rec) => {
      const isBorrowed = rec.status === "Borrowed";
      const matchedBook = books.find((b) => b.id === rec.bookId);
      const thumbSrc = escapeHtml(matchedBook?.coverImage || "Assets/Images/book-101.svg");

      const tr = document.createElement("tr");
      if (rec.refNumber === highlightedRef) {
        tr.classList.add("row-updated");
      }

      tr.innerHTML = `
        <td><strong>${escapeHtml(rec.refNumber)}</strong></td>
        <td>
          <div class="table-book-cell">
            <img src="${thumbSrc}" alt="" class="table-book-thumb" />
            <span>${escapeHtml(rec.bookTitle)}</span>
          </div>
        </td>
        <td>
          <div><strong>${escapeHtml(rec.borrowerName)}</strong></div>
          <small style="color: var(--color-text-muted);">${escapeHtml(rec.borrowerId)} &bull; ${escapeHtml(rec.borrowerEmail)}</small>
        </td>
        <td>${escapeHtml(rec.borrowDate)}</td>
        <td>${escapeHtml(rec.dueDate)}</td>
        <td>
          <span class="status-badge status-${rec.status.toLowerCase()}">
            ${escapeHtml(rec.status)}
          </span>
        </td>
        <td>
          <div class="action-group">
            <button type="button" class="btn btn-outline btn-sm action-view" data-ref="${escapeHtml(rec.refNumber)}">
              View
            </button>
            <button type="button" class="btn btn-outline btn-sm action-edit" data-ref="${escapeHtml(rec.refNumber)}">
              Edit Info
            </button>
            <button type="button" class="btn btn-outline btn-sm action-print" data-ref="${escapeHtml(rec.refNumber)}">
              Print Receipt
            </button>
            ${
              isBorrowed
                ? `<button type="button" class="btn btn-primary btn-sm action-return" data-ref="${escapeHtml(rec.refNumber)}">
                     Mark Returned
                   </button>
                   <button type="button" class="btn btn-outline btn-sm action-extend" data-ref="${escapeHtml(rec.refNumber)}">
                     +3 Days
                   </button>
                   <button type="button" class="btn btn-danger-outline btn-sm action-cancel" data-ref="${escapeHtml(rec.refNumber)}">
                     Cancel
                   </button>`
                : `<button type="button" class="btn btn-danger-outline btn-sm action-delete" data-ref="${escapeHtml(rec.refNumber)}">
                     Delete
                   </button>`
            }
          </div>
        </td>
      `;
      recordsTbody.appendChild(tr);
    });

    // Clear one-time highlight flag after painting
    highlightedRef = "";
  }

  recordsSearch.addEventListener("input", renderRecords);
  recordsStatusFilter.addEventListener("change", renderRecords);

  recordsTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const ref = btn.dataset.ref;
    const recIndex = records.findIndex((r) => r.refNumber === ref);
    if (recIndex === -1) return;
    const record = records[recIndex];

    if (btn.classList.contains("action-view")) {
      navigateWithLoader(`receipt.html?ref=${encodeURIComponent(ref)}`, `Loading receipt ${ref}...`);
      return;
    }

    if (btn.classList.contains("action-edit")) {
      openEditModal(record);
      return;
    }

    if (btn.classList.contains("action-print")) {
      PrintReceiptService.print(record, books);
      return;
    }

    if (btn.classList.contains("action-return")) {
      record.status = "Returned";
      const book = books.find((b) => b.id === record.bookId);
      if (book && book.availableCopies < book.totalCopies) {
        book.availableCopies += 1;
      }
      StorageService.saveBooks(books);
      StorageService.saveRecords(records);
      highlightedRef = ref;
      renderRecords();
      showToast(`Book marked as Returned (${ref}). Stock updated.`);
      return;
    }

    if (btn.classList.contains("action-extend")) {
      const currentDue = new Date(`${record.dueDate}T00:00:00`);
      currentDue.setDate(currentDue.getDate() + 3);
      const nextDueISO = `${currentDue.getFullYear()}-${String(currentDue.getMonth() + 1).padStart(2, "0")}-${String(currentDue.getDate()).padStart(2, "0")}`;

      if (calculateDaysBetween(record.borrowDate, nextDueISO) > 14) {
        showToast("Cannot extend: Total loan period cannot exceed 14 days.", "error");
        return;
      }
      record.dueDate = nextDueISO;
      StorageService.saveRecords(records);
      highlightedRef = ref;
      renderRecords();
      showToast(`Due date extended to ${nextDueISO} (${ref}).`);
      return;
    }

    if (btn.classList.contains("action-cancel")) {
      const confirmed = window.confirm(
        `Are you sure you want to CANCEL borrow transaction ${ref} for "${record.bookTitle}"?`
      );
      if (!confirmed) return;

      record.status = "Cancelled";
      const book = books.find((b) => b.id === record.bookId);
      if (book && book.availableCopies < book.totalCopies) {
        book.availableCopies += 1;
      }
      StorageService.saveBooks(books);
      StorageService.saveRecords(records);
      highlightedRef = ref;
      renderRecords();
      showToast(`Transaction ${ref} cancelled and book copy restored.`);
      return;
    }

    if (btn.classList.contains("action-delete")) {
      const confirmed = window.confirm(
        `Permanently delete record ${ref} from local browser storage?`
      );
      if (!confirmed) return;

      records.splice(recIndex, 1);
      StorageService.saveRecords(records);
      renderRecords();
      showToast(`Record ${ref} deleted.`);
    }
  });

  exportJsonBtn.addEventListener("click", () => {
    StorageService.exportRecordsToJson(records);
    showToast("Borrowing records exported as JSON.");
  });

  importJsonInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const importedList = Array.isArray(parsed) ? parsed : parsed.records;
        if (!Array.isArray(importedList)) {
          throw new Error("Invalid JSON structure.");
        }
        const validItems = importedList.filter(
          (item) => item && item.refNumber && item.bookTitle && item.borrowerName && item.status
        );
        if (validItems.length === 0) {
          throw new Error("No valid borrowing records found in file.");
        }
        records = validItems;
        StorageService.saveRecords(records);
        renderRecords();
        showToast(`Imported ${validItems.length} record(s) from JSON.`);
      } catch (err) {
        showToast(`JSON Import Failed: ${err.message}`, "error");
      } finally {
        importJsonInput.value = "";
      }
    };
    reader.readAsText(file);
  });

  resetDemoBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Reset catalog and borrowing records back to the original sample data?"
    );
    if (!confirmed) return;
    const fresh = StorageService.resetAll();
    books = fresh.books;
    records = fresh.records;
    renderRecords();
    showToast("Sample library data restored.");
  });

  renderRecords();
}
