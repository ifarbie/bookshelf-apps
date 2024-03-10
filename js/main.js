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
        Swal.fire({
            position: "top-start",
            icon: "success",
            title: "Sukses",
            text: `Berhasil menambahkan buku "${title}"`,
            showConfirmButton: false,
            timer: 1500,
            toast: true
        });

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

        const editBookButton = document.createElement('button');
        editBookButton.setAttribute("type", "button");
        editBookButton.innerHTML = "<i class='bi bi-pencil'></i>";
        editBookButton.classList.add('btn', 'btn-outline-primary', 'rounded-1', 'mx-3');
        editBookButton.addEventListener('click', function () {
            editBook(bookObject.id);
        })

        const deleteBookButton = document.createElement('button');
        deleteBookButton.setAttribute("type", "button");
        deleteBookButton.innerHTML = "<i class='bi bi-x-lg'></i>";
        deleteBookButton.classList.add('btn', 'btn-outline-danger', 'rounded-1');
        deleteBookButton.addEventListener('click', function () {
            Swal.fire({
                title: "Yakin Ingin Menghapus Buku?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#6c757d",
                cancelButtonColor: "#d33",
                confirmButtonText: "Hapus",
                cancelButtonText: "Batal"
            }).then((result) => {
                if (result.isConfirmed) {
                    deleteBook(bookObject.id);
                    Swal.fire({
                        title: "Terhapus!",
                        text: `Buku "${bookObject.title}" telah dihapus`,
                        icon: "success"
                    });
                }
            });
        });
        if (!bookObject.isComplete) {
            const checkBookButton = document.createElement('button');
            checkBookButton.setAttribute("type", "button");
            checkBookButton.innerHTML = "<i class='bi bi-check-lg'></i>";
            checkBookButton.classList.add('btn', 'btn-outline-success', 'rounded-1');
            checkBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, true);
            });

            bookActionContainer.append(checkBookButton, editBookButton, deleteBookButton);
        } else {
            const uncheckBookButton = document.createElement('button');
            uncheckBookButton.setAttribute("type", "button");
            uncheckBookButton.innerHTML = "<i class='bi bi-arrow-counterclockwise'></i>";
            uncheckBookButton.classList.add('btn', 'btn-outline-secondary', 'rounded-1');
            uncheckBookButton.addEventListener('click', function () {
                updateBookStatus(bookObject.id, false);
            });

            bookActionContainer.append(uncheckBookButton, editBookButton, deleteBookButton);
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

    async function editBook(bookId) {
        const bookTarget = findBook(bookId);
        if (bookTarget == null) {
            return;
        }

        const { value: formValues } = await Swal.fire({
            title: "Edit buku",
            html: `
            <div class="mb-2">
                <label for="newTitle" class="form-label">Judul</label>
                <input type="text" class="form-control italic-placeholder" id="newTitle" placeholder="(ex: Bumi)"
                required value="${bookTarget.title}">
            </div>
            <div class="mb-2">
                <label for="newAuthor" class="form-label">Penulis</label>
                <input type="text" class="form-control italic-placeholder" id="newAuthor"
                placeholder="(ex: Tere Liye)" required value="${bookTarget.author}">
            </div>
            <div class="mb-2">
                <label for="newYear" class="form-label">Tahun Terbit</label>
                <input type="number" class="form-control italic-placeholder" id="newYear" placeholder="(ex: 2014)"
                required value="${bookTarget.year}">
            </div>
            `,
            showCancelButton: true,
            cancelButtonText: "Batal",
            confirmButtonText: "Ubah",
            cancelButtonColor: "#d33",
            confirmButtonColor: "#198754",
            preConfirm: () => {
                return {
                    newTitle: document.getElementById("newTitle").value,
                    newAuthor: document.getElementById("newAuthor").value,
                    newYear: document.getElementById("newYear").value,
                };
            }
        });
        if (formValues) {
            Swal.fire({
                title: "Sukses",
                text: `Buku "${bookTarget.title}" telah diperbarui`,
                icon: "success",
                toast: true,
                showConfirmButton: false,
                timer: 1500,
                position: "top-start"
            });
            bookTarget.title = formValues.newTitle;
            bookTarget.author = formValues.newAuthor;
            bookTarget.year = formValues.newYear;
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