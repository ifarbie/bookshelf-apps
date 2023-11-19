document.addEventListener('DOMContentLoaded', function () {
    const inputBook = document.getElementById('inputBook');
    const searchBookForm = document.getElementById('searchBook');

    const BOOKS_DATA_KEY = 'BOOKS';

    const books = [];

    if (isStorageExist()) {
        loadBooksData();
    }

    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    })

    inputBook.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        clearInputBookForm();
    })

    function clearInputBookForm() {
        inputBook.reset();
    }

    function addBook() {
        const bookId = generateId();
        const title = inputBook['inputBookTitle'].value;
        const author = inputBook['inputBookAuthor'].value;
        const year = parseInt(inputBook['inputBookYear'].value);
        const isRead = inputBook['inputBookIsComplete'].checked;

        const bookObject = generateBookObject(bookId, title, author, year, isRead);
        books.push(bookObject);

        renderBooks();
        saveBooksData()
    }

    function clearBookShelfLists() {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
        incompleteBookshelfList.innerHTML = '';

        const completeBookshelfList = document.getElementById('completeBookshelfList');
        completeBookshelfList.innerHTML = '';
    }

    function renderBooks(filteredBooks = null) {
        clearBookShelfLists();

        if (filteredBooks) {
            for (const book of filteredBooks) {
                const bookItem = makeBookItem(book);
                if (!book.isComplete) {
                    incompleteBookshelfList.append(bookItem);
                } else {
                    completeBookshelfList.append(bookItem);
                }
            }
        } else {
            for (const book of books) {
                const bookItem = makeBookItem(book);
                if (!book.isComplete) {
                    incompleteBookshelfList.append(bookItem);
                } else {
                    completeBookshelfList.append(bookItem);
                }
            }
        }
    }

    function makeBookItem(bookObject) {
        const bookItem = document.createElement('article');
        bookItem.classList.add('book_item');
        bookItem.innerHTML = `
        <h2>${bookObject.title}</h2>
        <p>${bookObject.author}</p>
        <p>${bookObject.year}</p>`;

        const bookActionContainer = document.createElement('div');
        bookActionContainer.classList.add('action');

        const deleteBookButton = document.createElement('button');
        deleteBookButton.innerText = 'Hapus buku';
        deleteBookButton.classList.add('red');
        deleteBookButton.addEventListener('click', function () {
            deleteBook(bookObject.id);
        });

        if (!bookObject.isComplete) {
            const checkBookButton = document.createElement('button');
            checkBookButton.innerText = "Selesai dibaca";
            checkBookButton.classList.add('green');
            checkBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, true);
            });
            bookActionContainer.append(checkBookButton, deleteBookButton);
        } else {
            const uncheckBookButton = document.createElement('button');
            uncheckBookButton.innerText = 'Belum selesai dibaca';
            uncheckBookButton.classList.add('green');
            uncheckBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, false);
            });
            bookActionContainer.append(uncheckBookButton, deleteBookButton);
        }

        bookItem.append(bookActionContainer);
        return bookItem;
    }

    function updateBookStatus(bookId, isCheck) {
        const bookTarget = findBook(bookId);

        if (bookTarget == null) {
            return;
        }

        if (isCheck) {
            bookTarget.isComplete = true;
        } else {
            bookTarget.isComplete = false;
        }

        renderBooks();
        saveBooksData()
    }

    function deleteBook(bookId) {
        const bookIndex = findBookIndex(bookId);
        if (bookIndex == -1) {
            return;
        }

        books.splice(bookIndex, 1);

        renderBooks();
        saveBooksData()
    }

    function findBook(bookId) {
        for (const book of books) {
            if (book.id === bookId) {
                return book;
            }
        }

        return null;
    }

    function findBookIndex(bookId) {
        for (const index in books) {
            if (books[index].id === bookId) {
                return index;
            }
        }

        return -1;
    }

    function generateBookObject(id, title, author, year, isComplete) {
        return {
            id,
            title,
            author,
            year,
            isComplete,
        }
    }

    function generateId() {
        return +new Date();
    }

    function isStorageExist() {
        if (typeof (Storage) === 'function') {
            return true;
        } else {
            alert('Browser tidak mendukung local storage')
        }
    }

    function saveBooksData() {
        if (isStorageExist()) {
            const booksData = JSON.stringify(books);
            localStorage.setItem(BOOKS_DATA_KEY, booksData);
            renderBooks();
        }
    }

    function loadBooksData() {
        const serializedBooksData = localStorage.getItem(BOOKS_DATA_KEY);
        const parsedBooksData = JSON.parse(serializedBooksData);

        if (parsedBooksData != null) {
            for (book of parsedBooksData) {
                books.push(book);
            }
        }

        renderBooks();
    }

    function searchBook() {
        const keyword = searchBookForm['searchBookTitle'].value.toLowerCase();
        const filteredBooks = books.filter(function (book) {
            return book.title.toLowerCase().includes(keyword);
        });
        console.log(filteredBooks);
        renderBooks(filteredBooks);
    }

})