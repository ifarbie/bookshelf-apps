document.addEventListener('DOMContentLoaded', function () {
    const BOOKS_DATA_KEY = 'BOOKS';
    const books = [];

    if (isStorageExist()) {
        loadBooksData();
    }

    const inputBook = document.getElementById('inputBook');
    inputBook.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        inputBook.reset();
    })

    const searchBookForm = document.getElementById('searchBook');
    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    })

    function addBook() {
        const bookId = generateId();
        const title = inputBook['inputBookTitle'].value;
        const author = inputBook['inputBookAuthor'].value;
        const year = parseInt(inputBook['inputBookYear'].value);
        const isRead = inputBook['inputBookIsComplete'].checked;

        const bookObject = generateBookObject(bookId, title, author, year, isRead);
        books.push(bookObject);
        alert(`Buku ${title} telah ditambahkan!`);

        renderBooks();
        saveBooksData();
    }

    function clearBookShelfLists() {
        const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
        incompleteBookshelfList.innerHTML = ``;

        const completeBookshelfList = document.getElementById('completeBookshelfList');
        completeBookshelfList.innerHTML = ``;
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
        const bookActionContainer = document.createElement('div');
        bookActionContainer.classList.add('action');

        const deleteBookButton = document.createElement('button');
        deleteBookButton.setAttribute("type", "button");
        deleteBookButton.innerHTML = "<i class='bi bi-x-lg'></i>";
        deleteBookButton.classList.add('btn', 'btn-outline-danger', 'rounded-1', 'ms-3');
        deleteBookButton.addEventListener('click', function () {
            const isConfirmed = confirm("Apakah Anda yakin ingin menghapus buku ini?");
            if (isConfirmed) {
                deleteBook(bookObject.id);
                alert(`Buku ${bookObject.title} telah dihapus!`)
            }
            else {
                return alert("Batal menghapus buku");
            }
        });
        if (!bookObject.isComplete) {
            const checkBookButton = document.createElement('button');
            checkBookButton.setAttribute("type", "button");
            checkBookButton.innerHTML = "<i class='bi bi-check-lg'></i>";
            checkBookButton.classList.add('btn', 'btn-outline-success', 'rounded-1');
            checkBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, true);
            });

            bookActionContainer.append(checkBookButton, deleteBookButton);
        } else {
            const uncheckBookButton = document.createElement('button');
            uncheckBookButton.setAttribute("type", "button");
            uncheckBookButton.innerHTML = "<i class='bi bi-arrow-counterclockwise'></i>";
            uncheckBookButton.classList.add('btn', 'btn-outline-secondary', 'rounded-1');
            uncheckBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, false);
            });

            bookActionContainer.append(uncheckBookButton, deleteBookButton);
        }

        const bookItem = document.createElement('article');
        bookItem.classList.add('row', 'mb-2', 'book-item');

        const col = document.createElement('div');
        col.classList.add('col');
        
        const card = document.createElement('div');
        card.classList.add("card");
        
        const cardBody = document.createElement('div');
        cardBody.classList.add("card-body");
        cardBody.innerHTML = `
            <h3 class="card-title fs-5">${bookObject.title}</h3>
            <h6 class="card-subtitle text-body-secondary">${bookObject.year}</h6>
            <h4 class="card-subtitle text-body-secondary mb-2 fs-6">${bookObject.author}</h4>`;

        cardBody.append(bookActionContainer);
        card.append(cardBody);
        col.append(card);
        bookItem.append(col);

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
        saveBooksData();
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

        renderBooks(filteredBooks);
    }
})