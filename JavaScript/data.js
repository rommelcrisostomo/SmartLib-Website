const SAMPLE_BOOKS_JSON = [
  {
    id: "BK-101",
    isbn: "978-0-13-468599-1",
    title: "Clean Architecture & Software Craft",
    author: "Elena Vance",
    category: "Software Engineering",
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "Assets/Images/book-101.svg"
  },
  {
    id: "BK-102",
    isbn: "978-1-49-205681-2",
    title: "Modern Web Systems with HTML, CSS & JS",
    author: "Marcus Reyes",
    category: "Computer Science",
    totalCopies: 4,
    availableCopies: 3,
    coverImage: "Assets/Images/book-102.svg"
  },
  {
    id: "BK-103",
    isbn: "978-0-26-203384-8",
    title: "Foundations of Algorithms & Data Structures",
    author: "Dr. Clarissa Tan",
    category: "Computer Science",
    totalCopies: 2,
    availableCopies: 2,
    coverImage: "Assets/Images/book-103.svg"
  },
  {
    id: "BK-104",
    isbn: "978-1-09-811873-0",
    title: "Practical Database & Information Systems",
    author: "David Navarro",
    category: "Information Systems",
    totalCopies: 2,
    availableCopies: 1,
    coverImage: "Assets/Images/book-104.svg"
  },
  {
    id: "BK-105",
    isbn: "978-1-49-195766-0",
    title: "Applied Data Analytics & Visualization",
    author: "Hannah Alcantara",
    category: "Data Science",
    totalCopies: 1,
    availableCopies: 0,
    coverImage: "Assets/Images/book-105.svg"
  },
  {
    id: "BK-106",
    isbn: "978-0-59-313520-4",
    title: "The Midnight Rose Archive",
    author: "Julian Mendoza",
    category: "General Fiction",
    totalCopies: 3,
    availableCopies: 3,
    coverImage: "Assets/Images/book-106.svg"
  }
];

function buildInitialRecords() {
  const today = new Date();
  const formatDate = (offsetDays) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return [
    {
      refNumber: "LIB-2026-1001",
      bookId: "BK-102",
      bookTitle: "Modern Web Systems with HTML, CSS & JS",
      bookIsbn: "978-1-49-205681-2",
      borrowerName: "Camille Santos",
      borrowerId: "2026-0118",
      borrowerEmail: "camille.santos@gmail.com",
      borrowDate: formatDate(-2),
      dueDate: formatDate(5),
      notes: "Front-end prototype reference",
      status: "Borrowed",
      createdAt: new Date().toISOString()
    },
    {
      refNumber: "LIB-2026-1002",
      bookId: "BK-104",
      bookTitle: "Practical Database & Information Systems",
      bookIsbn: "978-1-09-811873-0",
      borrowerName: "Rafael Bautista",
      borrowerId: "2026-0245",
      borrowerEmail: "rafael.bautista@yahoo.com",
      borrowDate: formatDate(-1),
      dueDate: formatDate(6),
      notes: "System analysis review",
      status: "Borrowed",
      createdAt: new Date().toISOString()
    },
    {
      refNumber: "LIB-2026-1003",
      bookId: "BK-105",
      bookTitle: "Applied Data Analytics & Visualization",
      bookIsbn: "978-1-49-195766-0",
      borrowerName: "Andrea Lim",
      borrowerId: "2026-0309",
      borrowerEmail: "andrea.lim@gmail.com",
      borrowDate: formatDate(-3),
      dueDate: formatDate(4),
      notes: "Dashboard metrics study",
      status: "Borrowed",
      createdAt: new Date().toISOString()
    }
  ];
}
