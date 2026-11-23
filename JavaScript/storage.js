const STORAGE_KEYS = {
  BOOKS: "libribloom_books_v1",
  RECORDS: "libribloom_records_v1",
  LAST_RECEIPT: "libribloom_last_receipt_v1"
};

const StorageService = {
  getBooks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKS);
      if (!raw) {
        const cloned = JSON.parse(JSON.stringify(SAMPLE_BOOKS_JSON));
        this.saveBooks(cloned);
        return cloned;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid books array");
      }
      return parsed;
    } catch (error) {
      console.warn("Recovered from missing/corrupted book storage:", error);
      const fallback = JSON.parse(JSON.stringify(SAMPLE_BOOKS_JSON));
      this.saveBooks(fallback);
      return fallback;
    }
  },

  saveBooks(books) {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
    } catch (error) {
      console.error("Failed to write books to localStorage:", error);
    }
  },

  getRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (!raw) {
        const seeded = buildInitialRecords();
        this.saveRecords(seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid records array");
      }
      return parsed;
    } catch (error) {
      console.warn("Recovered from missing/corrupted records storage:", error);
      const fallback = buildInitialRecords();
      this.saveRecords(fallback);
      return fallback;
    }
  },

  saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (error) {
      console.error("Failed to write records to localStorage:", error);
    }
  },

  setLastReceipt(refNumber) {
    try {
      if (refNumber) {
        localStorage.setItem(STORAGE_KEYS.LAST_RECEIPT, refNumber);
      } else {
        localStorage.removeItem(STORAGE_KEYS.LAST_RECEIPT);
      }
    } catch (error) {
      console.warn("Could not save last receipt reference:", error);
    }
  },

  getLastReceipt() {
    try {
      return localStorage.getItem(STORAGE_KEYS.LAST_RECEIPT) || "";
    } catch {
      return "";
    }
  },

  resetAll() {
    const books = JSON.parse(JSON.stringify(SAMPLE_BOOKS_JSON));
    const records = buildInitialRecords();
    this.saveBooks(books);
    this.saveRecords(records);
    this.setLastReceipt(records[0]?.refNumber || "");
    return { books, records };
  },

  exportRecordsToJson(records) {
    const payload = {
      system: "LibriBloom Boutique Library Prototype",
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      records
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `smartlib_records_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
};
