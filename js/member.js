console.log("member.js loaded");

// Variabel Global untuk menyimpan status filter saat ini
let currentFilters = {
    search: '',
    type: '',
    category: '',
    genre: [] // UBAH: Genre sekarang berupa Array untuk menampung banyak tag
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded (member.js)");

    const container = document.getElementById('book-list-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-button');
    
    // Filter Containers
    const kategoriBukuOptions = document.getElementById('kategori-buku-options');
    const jenisBukuOptions = document.getElementById('jenis-buku-options');
    const genreBukuOptions = document.getElementById('genre-buku-options');
    
    // Filter Logic UI
    const filterBtn = document.getElementById('filter-button');
    const filterDropdown = document.getElementById('filter-dropdown');
    const currentFilterText = document.getElementById('current-filter-text');

    // Input Custom Genre
    const customGenreInput = document.getElementById('custom-genre-input');
    const addGenreBtn = document.getElementById('add-genre-btn');

    // --- Toggle Filter Dropdown ---
    if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
                filterDropdown.classList.remove('show');
            }
        });
    }

    // --- Helper: Reset UI Filter Aktif ---
    function hideAllFilterOptions() {
        if (jenisBukuOptions) jenisBukuOptions.classList.add("hidden");
        if (kategoriBukuOptions) kategoriBukuOptions.classList.add("hidden");
        if (genreBukuOptions) genreBukuOptions.classList.add("hidden");
    }

    // --- Helper: Update Text Filter di Tombol ---
    function updateFilterLabel(text) {
        if (currentFilterText) currentFilterText.textContent = text;
    }

    // --- Saat klik salah satu item di Dropdown Filter ---
    if (filterDropdown) {
        filterDropdown.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', (e) => {
                e.preventDefault();
                const filterType = a.dataset.filter;
                
                filterDropdown.classList.remove('show');
                hideAllFilterOptions();

                // Reset filter tipe & kategori (single value), tapi genre kita biarkan user reset manual atau reset jika pindah ke 'all'
                if (filterType !== 'genre') {
                    // Jika pindah menu selain genre, reset array genre (opsional, tergantung UX yg dimau)
                    // currentFilters.genre = []; 
                    // renderActiveGenres(); // Function helper jika perlu refresh UI
                }

                if (filterType === "all") {
                    updateFilterLabel("Semua");
                    // Reset Semua
                    currentFilters.type = '';
                    currentFilters.category = '';
                    currentFilters.genre = [];
                    resetGenreUI(); 
                    loadBooks(); 
                } 
                else if (filterType === "jenis_buku") {
                    updateFilterLabel("Jenis Buku");
                    if (jenisBukuOptions) jenisBukuOptions.classList.remove("hidden");
                } 
                else if (filterType === "kategori") {
                    updateFilterLabel("Kategori");
                    if (kategoriBukuOptions) kategoriBukuOptions.classList.remove("hidden");
                } 
                else if (filterType === "genre") {
                    updateFilterLabel("Genre");
                    if (genreBukuOptions) genreBukuOptions.classList.remove("hidden");
                }
            });
        });
    }

    // --- Handler: Jenis Buku (Single Select) ---
    if (jenisBukuOptions) {
        jenisBukuOptions.querySelectorAll('.jenis-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.type;
                // Toggle off jika diklik lagi
                if (currentFilters.type === val) {
                    currentFilters.type = '';
                    btn.classList.remove('bg-gray-400', 'text-white');
                    btn.classList.add('bg-gray-200', 'text-gray-800');
                } else {
                    jenisBukuOptions.querySelectorAll('.jenis-btn').forEach(b => {
                        b.classList.remove('bg-gray-400', 'text-white');
                        b.classList.add('bg-gray-200', 'text-gray-800');
                    });
                    currentFilters.type = val;
                    btn.classList.remove('bg-gray-200', 'text-gray-800');
                    btn.classList.add('bg-gray-400', 'text-white');
                }
                loadBooks();
            });
        });
    }

    // --- Handler: Kategori (Single Select) ---
    if (kategoriBukuOptions) {
        kategoriBukuOptions.querySelectorAll('.kategori-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.category;
                if (currentFilters.category === val) {
                    currentFilters.category = '';
                    btn.classList.remove('bg-gray-400', 'text-white');
                    btn.classList.add('bg-gray-200');
                } else {
                    kategoriBukuOptions.querySelectorAll('.kategori-btn').forEach(b => {
                        b.classList.remove('active', 'bg-gray-400', 'text-white');
                        b.classList.add('bg-gray-200');
                    });
                    currentFilters.category = val;
                    btn.classList.remove('bg-gray-200');
                    btn.classList.add('active', 'bg-gray-400', 'text-white');
                }
                loadBooks();
            });
        });
    }

    // ==========================================
    // --- LOGIKA BARU: MULTI GENRE SELECT ---
    // ==========================================
    
    function resetGenreUI() {
        if (!genreBukuOptions) return;
        genreBukuOptions.querySelectorAll('.genre-btn').forEach(b => {
            b.classList.remove('bg-purple-600', 'text-white', 'border-transparent');
            b.classList.add('bg-purple-100', 'text-purple-700', 'border-purple-300');
        });
        // Hapus tombol custom yang dibuat dinamis (opsional)
        document.querySelectorAll('.custom-genre-tag').forEach(el => el.remove());
    }

    function toggleGenre(genreValue, btnElement) {
        const index = currentFilters.genre.indexOf(genreValue);

        if (index > -1) {
            // Hapus jika sudah ada (Toggle OFF)
            currentFilters.genre.splice(index, 1);
            if(btnElement) {
                btnElement.classList.remove('bg-purple-600', 'text-white', 'border-transparent');
                btnElement.classList.add('bg-purple-100', 'text-purple-700', 'border-purple-300');
            }
        } else {
            // Tambah jika belum ada (Toggle ON)
            currentFilters.genre.push(genreValue);
            if(btnElement) {
                btnElement.classList.remove('bg-purple-100', 'text-purple-700', 'border-purple-300');
                btnElement.classList.add('bg-purple-600', 'text-white', 'border-transparent');
            }
        }
        console.log("Active Genres:", currentFilters.genre);
        loadBooks();
    }

    if (genreBukuOptions) {
        // Handler untuk tombol genre bawaan
        genreBukuOptions.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                toggleGenre(btn.dataset.genre, btn);
            });
        });

        // Handler untuk Custom Genre (+ Input)
        const handleCustomGenre = () => {
            const val = customGenreInput.value.trim();
            if (!val) return;

            // Cek apakah sudah ada di array (case insensitive check optional)
            if (!currentFilters.genre.includes(val)) {
                // Tambahkan ke array
                currentFilters.genre.push(val);
                
                // Buat tombol visual sementara agar user bisa menghapusnya (toggle off)
                const newBtn = document.createElement('button');
                newBtn.className = 'custom-genre-tag genre-btn px-4 py-2 bg-purple-600 text-white border border-transparent rounded-full hover:bg-purple-700 transition text-sm';
                newBtn.textContent = val + " x"; // Tambah tanda silang
                newBtn.dataset.genre = val;
                
                // Insert sebelum input text
                const inputWrapper = customGenreInput.parentElement;
                genreBukuOptions.insertBefore(newBtn, inputWrapper);

                // Event listener untuk tombol baru ini (klik untuk hapus)
                newBtn.addEventListener('click', () => {
                    const idx = currentFilters.genre.indexOf(val);
                    if (idx > -1) currentFilters.genre.splice(idx, 1);
                    newBtn.remove();
                    loadBooks();
                });

                loadBooks();
            }
            
            // Reset input
            customGenreInput.value = '';
        };

        if (addGenreBtn) {
            addGenreBtn.addEventListener('click', handleCustomGenre);
        }
        if (customGenreInput) {
            customGenreInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleCustomGenre();
            });
        }
    }

    // --- Fungsi Utama Memuat Buku ---
// Variabel Global
let currentFilters = {
    search: '',
    type: '',
    category: '',
    genre: []
};
let currentPage = 1;      // Melacak halaman saat ini
let isLoading = false;    // Mencegah double request

// --- Fungsi Utama Memuat Buku ---
async function loadBooks(reset = true) {
    if (isLoading) return;
    isLoading = true;

    // [PERBAIKAN 1] Ambil nilai Search Input PALING PERTAMA
    // Agar status isFiltering valid sebelum render UI
    const searchInputEl = document.getElementById('search-input');
    if (searchInputEl) {
        currentFilters.search = searchInputEl.value.trim();
    }

    // [PERBAIKAN 2] Cek apakah sedang ada filter aktif (Search teks / Kategori / Genre)
    const isFiltering = 
        currentFilters.search !== '' || 
        currentFilters.type !== '' || 
        currentFilters.category !== '' || 
        currentFilters.genre.length > 0;

    // [PERBAIKAN 3] Atur visibilitas Terpopuler BERDASARKAN INPUT (Bukan hasil API)
    // Jadi meskipun hasil bukunya 0 (tidak ditemukan), Terpopuler tetap sembunyi karena ada input teks.
    const popularWrapper = document.getElementById('popular-books-wrapper');
    if (popularWrapper) {
        if (isFiltering) {
            popularWrapper.classList.add('hidden'); // Sembunyikan jika ada ketikan/filter
        } else {
            popularWrapper.classList.remove('hidden'); // Munculkan jika bersih (awal buka)
        }
    }

    // --- SISA KODE LOGIKA LOAD DATA (Tetap Sama) ---
    if (reset) {
        currentPage = 1;
    }

    const container = document.getElementById('book-list-container');
    const loadMoreBtn = document.getElementById('btn-load-more-wrapper');
    
    if (loadMoreBtn) loadMoreBtn.remove();

    if (reset) {
        container.innerHTML = `
            <div class="w-full text-center text-gray-400 min-w-[200px]">
                <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
                <p>Memuat...</p>
            </div>`;
    }
    
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', 10); 
    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.type) params.append('type', currentFilters.type);
    if (currentFilters.category) params.append('category', currentFilters.category);
    if (currentFilters.genre && currentFilters.genre.length > 0) {
        currentFilters.genre.forEach(g => params.append('genre', g));
    }

    try {
        const res = await fetch('/books?' + params.toString());
        if (!res.ok) throw new Error("Gagal mengambil data");
        
        const books = await res.json();
        
        if (reset) container.innerHTML = '';

        // Render buku (akan menampilkan pesan "Tidak Ditemukan" jika kosong)
        renderBooks(books, reset);

        if (books.length >= 10) {
            renderLoadMoreButton();
        }

    } catch (err) {
        console.error("Load books error:", err);
        if (reset) container.innerHTML = '<p class="text-red-500 w-full text-center">Gagal memuat data.</p>';
    } finally {
        isLoading = false;
    }
}

// Fungsi Render Tombol Load More (Berbentuk Kartu di Ujung Kanan)
function renderLoadMoreButton() {
    const container = document.getElementById('book-list-container');
    
    const btnWrapper = document.createElement('div');
    btnWrapper.id = 'btn-load-more-wrapper';
    // Style agar mirip kartu tapi isinya tombol
    btnWrapper.className = 'flex-none snap-start flex items-center justify-center w-[28vw] md:w-[15vw] aspect-[2/3.5]';
    
    btnWrapper.innerHTML = `
        <button id="btn-load-more" class="flex flex-col items-center justify-center gap-2 text-indigo-600 hover:text-indigo-800 transition group">
            <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition">
                <i class="fas fa-arrow-right"></i>
            </div>
            <span class="text-xs font-bold">Lihat Lainnya</span>
        </button>
    `;

    container.appendChild(btnWrapper);

    // Event Listener
    document.getElementById('btn-load-more').addEventListener('click', () => {
        currentPage++; // Naik ke halaman 2, 3, dst
        loadBooks(false); // False = Jangan hapus data lama, tapi tambahkan
    });
}
  // --- Render Buku ke HTML ---
  function renderBooks(books, reset) {
    const container = document.getElementById('book-list-container');

    // Jika reset dan data kosong
    if (reset && (!books || books.length === 0)) {
        container.innerHTML = `... (Kode HTML Kosong Anda yang lama) ...`;
        return;
    }

    // Jika ini append (Load More), dan ternyata data kosong (habis)
    if (!reset && books.length === 0) {
        // Hapus tombol load more
        const btn = document.getElementById('btn-load-more-wrapper');
        if(btn) btn.remove();
        return;
    }

    books.forEach(book => {
        const card = document.createElement('div');
        
        // Layout Kartu
        card.className = 'flex-none snap-start bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer group flex flex-col overflow-hidden w-[28vw] md:w-[15vw] aspect-[2/3.5]';
        
        card.addEventListener('click', () => {
            window.location.href = `/buka_buku_member.html?id=${book.id}`;
        });

        // Handle Cover
        let coverHTML;
        if (book.coverFile) {
            coverHTML = `
            <div class="relative w-full h-[65%] overflow-hidden bg-gray-900 group-hover:brightness-110 transition">
                <div class="absolute inset-0 bg-cover bg-center blur-md opacity-60 scale-125" 
                     style="background-image: url('/${book.coverFile}');">
                </div>
                <div class="relative z-10 h-full w-full flex items-center justify-center p-1.5 md:p-3">
                    <img src="/${book.coverFile}" alt="${book.title}" 
                         class="h-full w-auto max-w-full object-contain shadow-lg transform group-hover:scale-105 transition duration-500 rounded-sm">
                </div>
            </div>`;
        } else {
            coverHTML = `
                <div class="w-full h-[65%] bg-gray-200 flex items-center justify-center">
                    <i class="fas fa-book text-gray-400 text-2xl md:text-3xl"></i>
                </div>`;
        }

        // Genre Badges
        let genreBadges = '';
        if (book.genre) {
            const genresList = book.genre.split(',').map(s => s.trim());
            genresList.slice(0, 1).forEach(g => {
                genreBadges += `<span class="text-[8px] md:text-[10px] px-1.5 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-100 inline-block truncate max-w-full">${g}</span>`;
            });
        }

        // --- LOGIKA STATUS TERSEDIA ---
        let statusHTML = '';
        
        // Cek Tipe Buku
        if (book.type === 'Ebook') {
            // Jika cuma Ebook -> Tidak tersedia di rak fisik
            statusHTML = `<span class="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                            Hanya Ebook
                          </span>`;
        } else {
            // Jika Buku Fisik (atau Fisik & Ebook)
            if (book.stock > 0) {
                statusHTML = `<span class="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">
                                Tersedia di Rak
                              </span>`;
            } else {
                statusHTML = `<span class="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                                Habis Dipinjam
                              </span>`;
            }
        }

        // Render Isi
        card.innerHTML = `
            ${coverHTML}
            
            <div class="h-[35%] w-full p-1.5 md:p-3 flex flex-col justify-between bg-white">
                <div>
                    <div class="flex items-center gap-1 mb-0.5 md:mb-1">
                        ${genreBadges}
                    </div>
                    
                    <h3 class="font-bold text-gray-800 leading-tight line-clamp-2 text-[10px] md:text-sm mb-0.5 group-hover:text-indigo-600 transition">
                        ${book.title}
                    </h3>
                    
                    <p class="text-[8px] md:text-xs text-gray-500 truncate">
                        ${book.author}
                    </p>
                </div>

                <div class="flex justify-between items-end mt-0.5 md:mt-1 border-t border-gray-50 pt-1">
                    <span class="text-[8px] md:text-[10px] text-gray-400 truncate w-1/3">${book.category || '-'}</span>
                    
                    <div class="flex justify-end w-2/3">
                        ${statusHTML}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}
    // --- Event Search Button & Enter ---
    if (searchBtn) {
        searchBtn.addEventListener('click', () => loadBooks(true));
    }
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') loadBooks(true);
        });
    }

    // Load awal
    loadBooks();
  // ==========================================
    // --- CAROUSEL LOGIC (SLIDING & RESPONSIVE) ---
    // ==========================================
    const carouselTrack = document.getElementById('carousel-track');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    let carouselData = [];
    let currentCarouselIndex = 0;
    let autoSlideInterval;

    async function initCarousel() {
        if (!carouselTrack) return;

        try {
            const res = await fetch('/api/books/random'); 
            if (!res.ok) throw new Error("Gagal load carousel");
            
            carouselData = await res.json();
            renderCarousel(carouselData);

        } catch (err) {
            console.error("Carousel error:", err);
            carouselTrack.innerHTML = `
                <div class="min-w-full h-full flex items-center justify-center text-indigo-200">
                    <p>Gagal memuat rekomendasi.</p>
                </div>`;
        }
    }

    function renderCarousel(books) {
        carouselTrack.innerHTML = '';
        
        if (!books || books.length === 0) {
            carouselTrack.innerHTML = '<div class="min-w-full h-full flex items-center justify-center">Tidak ada rekomendasi.</div>';
            return;
        }

        books.forEach((book) => {
            // Setup Gambar
            let coverSrc = book.cover ? `/${book.cover}` : '/img/default_book.png';
            
            // Setup Deskripsi (Jika kosong)
            let synopsis = book.synopsis || "Sinopsis tidak tersedia.";
            
            // Buat Element Slide
            const slide = document.createElement('div');
            // 'min-w-full' penting agar slide berjejer ke samping
            slide.className = 'min-w-full h-full flex flex-row md:flex-col relative';

            slide.innerHTML = `
                <div class="w-[35%] h-full md:w-full md:h-[45%] relative overflow-hidden bg-gray-900 cursor-pointer group" onclick="window.location.href='/buka_buku_member.html?id=${book.id}'">
                    <div class="absolute inset-0 bg-cover bg-center blur-md opacity-60 scale-110" style="background-image: url('${coverSrc}');"></div>
                    <div class="relative z-10 h-full w-full flex items-center justify-center p-2 md:p-4">
                        <img src="${coverSrc}" class="h-full max-h-[90%] md:max-h-full object-contain rounded shadow-lg transform hover:scale-105 transition duration-500">
                    </div>
                </div>

                <div class="w-[65%] h-full md:w-full md:h-[55%] px-3 py-3 md:px-6 md:py-4 flex flex-col items-start md:items-center justify-center text-left md:text-center bg-gradient-to-r md:bg-gradient-to-b from-indigo-900 to-indigo-800 border-l md:border-l-0 md:border-t border-indigo-500/30">
                    
                    <h3 class="text-base md:text-2xl font-bold text-white leading-snug mb-1 line-clamp-2 drop-shadow-md">
                        ${book.title}
                    </h3>
                    
                    <p class="text-indigo-300 text-[10px] md:text-sm font-medium mb-1 md:mb-3 uppercase tracking-wide">
                        ${book.author}
                    </p>
                    
                    <p class="text-indigo-100 text-sm leading-relaxed line-clamp-3 opacity-90 mb-4 hidden md:block px-2">
                        ${synopsis}
                    </p>
                    
                    <p class="text-indigo-100 text-[10px] leading-relaxed line-clamp-2 opacity-90 mb-2 md:hidden">
                        ${synopsis.substring(0, 80)}...
                    </p>

                    <div class="mt-auto md:mt-auto w-full flex justify-start md:justify-center">
                        <a href="/buka_buku_member.html?id=${book.id}" class="px-4 py-1.5 md:px-8 md:py-2 bg-white text-indigo-900 text-[10px] md:text-sm font-bold rounded-full hover:bg-indigo-50 transition shadow-lg transform hover:-translate-y-1">
                            Lihat Detail
                        </a>
                    </div>
                </div>
            `;
            carouselTrack.appendChild(slide);
        });

        // Tampilkan tombol navigasi jika slide > 1
        if (books.length > 1) {
            startAutoSlide();
        } else {
            if(prevBtn) prevBtn.style.display = 'none';
            if(nextBtn) nextBtn.style.display = 'none';
        }
    }

    // Fungsi Geser (Menggunakan Translate X)
    function updateSlidePosition() {
        if (!carouselTrack) return;
        const offset = -currentCarouselIndex * 100; // -0%, -100%, -200%
        carouselTrack.style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        if (carouselData.length === 0) return;
        currentCarouselIndex = (currentCarouselIndex + 1) % carouselData.length;
        updateSlidePosition();
    }

    function prevSlide() {
        if (carouselData.length === 0) return;
        currentCarouselIndex = (currentCarouselIndex - 1 + carouselData.length) % carouselData.length;
        updateSlidePosition();
    }

    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000); 
    }

    // Event Listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            startAutoSlide(); 
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            startAutoSlide();
        });
    }

    // Jalankan Carousel
    initCarousel();
  // ==========================================
    // --- POPULAR BOOKS LOGIC ---
    // ==========================================
    async function loadPopularBooks() {
        const container = document.getElementById('popular-book-container');
        if (!container) return;

        try {
            const res = await fetch('/api/books/popular');
            if (!res.ok) throw new Error("Gagal load popular books");
            const books = await res.json();

            container.innerHTML = '';

            if (!books || books.length === 0) {
                container.innerHTML = '<p class="text-gray-400 text-sm">Belum ada data popularitas.</p>';
                return;
            }

            books.forEach((book, index) => {
                const card = document.createElement('div');
                card.className = 'flex-none snap-start bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-yellow-100 cursor-pointer group flex flex-col w-[35vw] md:w-[12vw] aspect-[2/3.2] relative overflow-hidden';
                
                card.onclick = () => {
                    window.location.href = `/buka_buku_member.html?id=${book.id}`;
                };

                // Ranking Badge
                const rankBadge = `
                    <div class="absolute top-2 left-2 z-20 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-yellow-500 text-white font-bold text-xs md:text-sm shadow-md border-2 border-white">
                        #${index + 1}
                    </div>
                `;

                // Gambar
                let coverSrc = book.coverFile ? `/${book.coverFile}` : '/img/default_book.png';
                const imgHTML = `
                    <div class="relative w-full h-[70%] overflow-hidden bg-gray-900">
                        <div class="absolute inset-0 bg-cover bg-center blur-sm opacity-50" style="background-image: url('${coverSrc}');"></div>
                        <div class="relative z-10 h-full w-full flex items-center justify-center p-2">
                            <img src="${coverSrc}" class="h-full max-w-full object-contain shadow-md rounded-sm transform group-hover:scale-105 transition duration-500">
                        </div>
                    </div>
                `;

                // Info (PERBAIKAN: Baris Skor Dihapus)
                const infoHTML = `
                    <div class="h-[30%] w-full p-2 bg-gradient-to-b from-white to-yellow-50 flex flex-col justify-center text-center">
                        <h3 class="font-bold text-gray-800 leading-tight line-clamp-2 text-[10px] md:text-sm mb-1 group-hover:text-yellow-600 transition">
                            ${book.title}
                        </h3>
                        <p class="text-[9px] md:text-xs text-gray-500 truncate">
                            ${book.author}
                        </p>
                    </div>
                `;

                card.innerHTML = rankBadge + imgHTML + infoHTML;
                container.appendChild(card);
            });

        } catch (err) {
            console.error("Popular books error:", err);
            container.innerHTML = '';
        }
    }

    // Panggil fungsi ini
    loadPopularBooks();
});