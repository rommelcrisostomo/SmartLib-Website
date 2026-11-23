/**
 * js/validation.js
 * Validates form inputs, enforces multi-word borrower full names (requires a space),
 * verifies genuine email domains (Gmail, Yahoo, Outlook, .edu),
 * and checks library business rules against saved records.
 */

function getTodayLocalISO() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function calculateDaysBetween(startISO, endISO) {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Enforces a multi-word full name separated by at least one space (rejects single-word names).
 */
function validateFullName(rawName) {
  const normalized = String(rawName || "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Borrower full name is required.";
  }

  const validCharsPattern = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ.'-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿÑñ.'-]+)*$/;
  if (!validCharsPattern.test(normalized)) {
    return "Full name may only contain letters, spaces, hyphens, apostrophes, or periods (no numbers or symbols).";
  }

  const words = normalized.split(" ");

  if (words.length < 2) {
    return "Single-word names are not accepted. Enter first and last name separated by a space (e.g., Clarisse Mendoza).";
  }

  const substantiveWords = words.filter((w) => w.replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ]/g, "").length >= 2);
  if (substantiveWords.length < 2) {
    return "Both first name and last name must contain at least 2 letters.";
  }

  if (/(.)\1{2,}/i.test(normalized)) {
    return "Please enter a real full name without repeated characters.";
  }

  const blockedWords = [
    "test",
    "testing",
    "fake",
    "asdf",
    "asdasd",
    "qwerty",
    "none",
    "null",
    "sample",
    "dummy",
    "unknown",
    "anonymous",
    "user",
    "admin"
  ];
  const hasNonsenseWord = words.some((w) =>
    blockedWords.includes(w.toLowerCase().replace(/[^a-z]/g, ""))
  );
  if (hasNonsenseWord) {
    return "Please enter the borrower's real first and last name, not placeholder text.";
  }

  return "";
}

/**
 * Validates that an email address belongs to a legitimate provider (e.g., Gmail, Yahoo)
 * and rejects nonsense usernames or fake domains.
 */
function validateGenuineEmail(email) {
  const cleanEmail = String(email || "").trim();
  if (!cleanEmail) {
    return "Email address is required.";
  }

  const basicFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!basicFormat.test(cleanEmail)) {
    return "Enter a valid email format (e.g., clarisse.mendoza@gmail.com).";
  }

  const [localPartRaw, domainRaw] = cleanEmail.split("@");
  const localPart = localPartRaw.toLowerCase();
  const domain = domainRaw.toLowerCase();

  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
    return "Email username cannot start/end with a dot or contain consecutive dots.";
  }

  if (localPart.length < 3) {
    return "Email username must be at least 3 characters long.";
  }

  if (/^\d+$/.test(localPart) || /^(.)\1+$/.test(localPart)) {
    return "Please enter a real email username, not numbers or repeated characters.";
  }

  const blockedNonsenseUsernames = [
    "test",
    "testing",
    "fake",
    "asdf",
    "asdasd",
    "qwerty",
    "none",
    "na",
    "null",
    "sample",
    "example",
    "dummy",
    "abc",
    "xyz",
    "noreply",
    "user",
    "admin"
  ];
  if (blockedNonsenseUsernames.includes(localPart)) {
    return `"${localPartRaw}" looks like placeholder text. Please enter your actual email address.`;
  }

  const allowedDomains = [
    "gmail.com",
    "yahoo.com",
    "yahoo.com.ph",
    "outlook.com",
    "hotmail.com",
    "icloud.com"
  ];
  const isTrustedInstitution =
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.ph") ||
    domain.endsWith(".gov.ph");

  if (!allowedDomains.includes(domain) && !isTrustedInstitution) {
    return "Please use a valid email provider such as @gmail.com, @yahoo.com, @outlook.com, or a .edu.ph address.";
  }

  return "";
}

const ValidationService = {
  validateBorrowRequest(formData, books, records) {
    const fieldErrors = {};
    let ruleError = "";

    const todayISO = getTodayLocalISO();
    const normalizedName = formData.borrowerName.trim().replace(/\s+/g, " ");
    const cleanId = formData.borrowerId.trim();
    const cleanEmail = formData.borrowerEmail.trim();

    const selectedBook = books.find((b) => b.id === formData.bookId);
    if (!selectedBook) {
      fieldErrors.bookId = "Please select a book from the catalog.";
    } else if (selectedBook.availableCopies <= 0) {
      fieldErrors.bookId = `"${selectedBook.title}" is currently out of stock (0 copies left).`;
    }

    const nameError = validateFullName(normalizedName);
    if (nameError) {
      fieldErrors.borrowerName = nameError;
    }

    const idPattern = /^\d{4}-\d{4}$/;
    if (!cleanId) {
      fieldErrors.borrowerId = "Student or Library ID is required.";
    } else if (!idPattern.test(cleanId)) {
      fieldErrors.borrowerId = "Use the format YYYY-XXXX (e.g., 2026-1042).";
    }

    const emailError = validateGenuineEmail(cleanEmail);
    if (emailError) {
      fieldErrors.borrowerEmail = emailError;
    }

    if (!formData.borrowDate) {
      fieldErrors.borrowDate = "Borrow date is required.";
    } else if (formData.borrowDate < todayISO) {
      fieldErrors.borrowDate = "Borrow date cannot be earlier than today.";
    }

    if (!formData.dueDate) {
      fieldErrors.dueDate = "Return due date is required.";
    } else if (formData.borrowDate && formData.dueDate <= formData.borrowDate) {
      fieldErrors.dueDate = "Due date must be at least 1 day after the borrow date.";
    } else if (formData.borrowDate) {
      const loanDays = calculateDaysBetween(formData.borrowDate, formData.dueDate);
      if (loanDays > 14) {
        fieldErrors.dueDate = `Loan duration is ${loanDays} days. Maximum allowed loan is 14 days.`;
      }
    }

    if (selectedBook && cleanId && idPattern.test(cleanId)) {
      const activeLoansForUser = records.filter(
        (rec) => rec.borrowerId === cleanId && rec.status === "Borrowed"
      );

      const alreadyBorrowedSameBook = activeLoansForUser.some(
        (rec) => rec.bookId === selectedBook.id
      );
      if (alreadyBorrowedSameBook) {
        ruleError = `Business Rule: Borrower ID ${cleanId} already has an active loan for "${selectedBook.title}".`;
      }

      if (!ruleError && activeLoansForUser.length >= 3) {
        ruleError = `Business Rule: Borrower ID ${cleanId} has reached the limit of 3 active borrowed books.`;
      }
    }

    const isValid = Object.keys(fieldErrors).length === 0 && !ruleError;
    return { isValid, fieldErrors, ruleError, selectedBook, normalizedName };
  },

  validateBorrowerEdit(editData, currentRecord, records) {
    const fieldErrors = {};
    let ruleError = "";

    const normalizedName = editData.borrowerName.trim().replace(/\s+/g, " ");
    const cleanId = editData.borrowerId.trim();
    const cleanEmail = editData.borrowerEmail.trim();

    const nameError = validateFullName(normalizedName);
    if (nameError) {
      fieldErrors.borrowerName = nameError;
    }

    const idPattern = /^\d{4}-\d{4}$/;
    if (!cleanId) {
      fieldErrors.borrowerId = "Student or Library ID is required.";
    } else if (!idPattern.test(cleanId)) {
      fieldErrors.borrowerId = "Use the format YYYY-XXXX (e.g., 2026-1042).";
    }

    const emailError = validateGenuineEmail(cleanEmail);
    if (emailError) {
      fieldErrors.borrowerEmail = emailError;
    }

    if (currentRecord.status === "Borrowed" && cleanId && idPattern.test(cleanId)) {
      const otherActiveLoans = records.filter(
        (rec) =>
          rec.refNumber !== currentRecord.refNumber &&
          rec.borrowerId === cleanId &&
          rec.status === "Borrowed"
      );

      const duplicateSameBook = otherActiveLoans.some(
        (rec) => rec.bookId === currentRecord.bookId
      );
      if (duplicateSameBook) {
        ruleError = `Business Rule: Borrower ID ${cleanId} already holds another active loan for "${currentRecord.bookTitle}".`;
      }

      if (!ruleError && otherActiveLoans.length >= 3) {
        ruleError = `Business Rule: Borrower ID ${cleanId} already has 3 active borrowed books.`;
      }
    }

    const isValid = Object.keys(fieldErrors).length === 0 && !ruleError;
    return { isValid, fieldErrors, ruleError, normalizedName };
  }
};