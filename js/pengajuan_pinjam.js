document.addEventListener("DOMContentLoaded", () => {
    const ebookBtn = document.getElementById("tab-ebook");
    const historyBtn = document.getElementById("tab-history");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-button");
    const bookContainer = document.getElementById('book-list-container');
    const historyContainer = document.getElementById("history-container");
    const filterOptions = document.getElementById("jenis-pinjam-options");

    let activeTab = 'ebook';
    let historyStatusFilter = "";

// ==========================================
    // 1. LOAD BOOKS (GAYA DASHBOARD MEMBER)
    // ==========================================
    async function loadBooks(searchQuery = '') {
        bookContainer.innerHTML = '<p class="w-full text-center text-gray-500 mt-10"><i class="fas fa-spinner fa-spin"></i> Memuat daftar...</p>';

        let url = '/books';
        const params = new URLSearchParams();

        // 1. Filter Search
        if (searchQuery) {
            params.append('search', searchQuery);
        }

        // 2. [PENTING] Filter Tipe: Hanya Buku Fisik (Backend akan otomatis include Fisik & Ebook)
        // Ini akan menyembunyikan buku yang tipe-nya cuma "Ebook"
        params.append('type', 'Buku Fisik'); 

        // Pagination default (bisa ditambah load more nanti jika mau)
        params.append('limit', 20); 

        url += '?' + params.toString();

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("HTTP error " + res.status);
            const books = await res.json();

            bookContainer.innerHTML = '';
            
            if (!books || books.length === 0) {
                bookContainer.innerHTML = `
                    <div class="w-full text-center text-gray-500 py-10">
                        <i class="fas fa-search text-4xl mb-2 text-gray-300"></i>
                        <p>Tidak ada buku fisik yang ditemukan.</p>
                    </div>`;
                return;
            }

            books.forEach(book => {
                const card = document.createElement('div');
                
                // --- STYLE KARTU PERSIS DASHBOARD MEMBER ---
                // Menggunakan w-[28vw] di HP dan aspect ratio yang sama
                card.className = 'flex-none snap-start bg-white rounded-lg md:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer group flex flex-col overflow-hidden w-[28vw] md:w-[15vw] aspect-[2/3.5]';

                card.addEventListener('click', () => {
                    window.location.href = `/buka_buku_member.html?id=${book.id}`;
                });

                // Handle Cover (Efek Blur)
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

                // Status Stok (Tampilan Dashboard)
                let statusHTML = '';
                if (book.stock > 0) {
                    statusHTML = `<span class="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200">Ada</span>`;
                } else {
                    statusHTML = `<span class="text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">Habis</span>`;
                }

                // Isi HTML Kartu
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

                        <div class="flex justify-between items-center mt-0.5 md:mt-1 border-t border-gray-50 pt-0.5 md:pt-1">
                            <span class="text-[8px] md:text-[10px] text-gray-400 truncate w-1/2">${book.category || '-'}</span>
                        
                        </div>
                    </div>
                `;

                bookContainer.appendChild(card);
            });

        } catch (err) {
            console.error("Load books error:", err);
            bookContainer.innerHTML = '<p class="col-span-full text-center text-red-500">Gagal memuat buku.</p>';
        }
    }

  // ==========================================
    // 2. LOAD HISTORY (RESPONSIVE & COPY ID)
    // ==========================================
    async function loadHistory(searchQuery = '') {
        historyContainer.innerHTML = '<p class="text-center text-gray-500 py-8"><i class="fas fa-spinner fa-spin"></i> Memuat riwayat...</p>';
        try {
            const res = await fetch('/api/riwayat-pinjam');
            if (!res.ok) throw new Error("Gagal mengambil data");

            const history = await res.json();
            historyContainer.innerHTML = '';

            if (!history || history.length === 0) {
                historyContainer.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-10 text-gray-400">
                        <i class="fas fa-history text-4xl mb-2"></i>
                        <p>Belum ada riwayat transaksi.</p>
                    </div>`;
                return;
            }

            const filtered = history.filter(item =>
                item.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.id.toString().includes(searchQuery)
            );

            filtered.forEach(item => {
                const card = document.createElement('div');
                // Layout: HP (Stack ke bawah antara Info & Tombol), Desktop (Menyamping)
                card.className = 'bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col md:flex-row gap-4 relative';
                
                // Set data-status untuk filter
                const currentStatus = item.status ? item.status.toUpperCase() : "";
                card.setAttribute("data-status", currentStatus);

                // --- 1. WRAPPER KIRI (GAMBAR + INFO) ---
                // flex-row: Agar gambar SELALU di kiri teks, baik di HP maupun Desktop
              // --- 1. WRAPPER KIRI (GAMBAR + INFO) ---
              const contentWrapper = document.createElement('div');
              contentWrapper.className = 'flex flex-row gap-4 flex-1 min-w-0';

              // --- A. GAMBAR BUKU (STYLE BARU: BLUR + CONTAIN) ---
              // Kita ganti elemen <img> biasa dengan DIV wrapper agar bisa kasih efek blur
              const imgWrapper = document.createElement('div');
              
              // Ukuran tetap: w-20 h-28 (HP) dan w-24 h-36 (Desktop)
              // bg-gray-900: Warna dasar gelap agar blur terlihat bagus
              imgWrapper.className = 'relative w-20 h-28 md:w-24 md:h-36 flex-shrink-0 overflow-hidden rounded-lg bg-gray-900 shadow-sm border border-gray-200 group cursor-pointer';
              
              let coverSrc = item.coverFile ? '/' + item.coverFile : '/uploads/default_book.png';

              imgWrapper.innerHTML = `
                  <div class="absolute inset-0 bg-cover bg-center blur-sm opacity-50 scale-125 transition duration-500 group-hover:scale-150" 
                       style="background-image: url('${coverSrc}');">
                  </div>
                  
                  <div class="relative z-10 h-full w-full flex items-center justify-center p-1">
                      <img src="${coverSrc}" alt="${item.bookTitle}" 
                           class="h-full w-auto max-w-full object-contain shadow-md transform group-hover:scale-105 transition duration-500 rounded-sm">
                  </div>
              `;
              
              contentWrapper.appendChild(imgWrapper);

              // --- B. INFO TEXT ---
              const info = document.createElement('div');
              // ... (Kode Info Text di bawahnya TETAP SAMA seperti sebelumnya) ...

                // Header Info (ID & Copy Button)
           // Header Info (ID & Copy Button)
           let headerHtml = `
           <div class="flex items-center gap-2 mb-2 flex-wrap">
               
               <div class="flex items-center bg-gray-100 text-gray-700 text-xs md:text-sm font-bold px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm">
                   <span class="mr-2">ID: #${item.id}</span>
                   
                   <button onclick="copyToClipboard('${item.id}')" 
                           class="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                           title="Salin ID Transaksi">
                       <i class="far fa-copy text-sm md:text-base"></i>
                   </button>
               </div>

               ${getStatusBadge(currentStatus)}
           </div>
           
           <h3 class="text-base md:text-xl font-bold text-gray-800 leading-tight line-clamp-2 mt-1" title="${item.bookTitle}">
               ${item.bookTitle}
           </h3>
       `;

                // Helper Format Tanggal
                const fmtDate = (dateStr) => {
                    if (!dateStr) return "-";
                    return new Date(dateStr).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric' //, hour: '2-digit', minute: '2-digit' (Opsional jika mau jam)
                    });
                };

                // Logic Timeline Ringkas
                let timelineHtml = `<div class="mt-2 text-xs text-gray-600 space-y-1">`;
                
                // Tampilkan tanggal relevan saja agar tidak penuh di HP
                if(currentStatus === 'DIAJUKAN') {
                    timelineHtml += `<p><i class="far fa-clock w-4"></i> Diajukan: <b>${fmtDate(item.dateRequested)}</b></p>`;
                } else if (currentStatus === 'DIPINJAM') {
                    timelineHtml += `<p class="text-indigo-600"><i class="fas fa-hand-holding w-4"></i> Dipinjam: <b>${fmtDate(item.dateBorrowed)}</b></p>`;
                    timelineHtml += `<p class="text-gray-500"><i class="fas fa-flag-checkered w-4"></i> Batas: <b>${fmtDate(item.dateDue)}</b></p>`;
                } else if (currentStatus === 'DIKEMBALIKAN') {
                    timelineHtml += `<p class="text-green-600"><i class="fas fa-check-circle w-4"></i> Kembali: <b>${fmtDate(item.dateReturned)}</b></p>`;
                } else {
                    // Status lain (Ditolak/Batal/Hilang) ambil update terakhir
                    timelineHtml += `<p>Update: <b>${fmtDate(item.dateRejected || item.dateCanceled || item.dateLost || item.dateRequested)}</b></p>`;
                }
                
                // Info Denda (Jika ada)
                if (item.fineTotal > 0) {
                    timelineHtml += `
                        <div class="mt-1 inline-flex items-center gap-1 text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-[10px]">
                            <i class="fas fa-exclamation-circle"></i> Denda: Rp ${Number(item.fineTotal).toLocaleString("id-ID")}
                        </div>`;
                }

                timelineHtml += `</div>`;
                info.innerHTML = headerHtml + timelineHtml;
                contentWrapper.appendChild(info);
                card.appendChild(contentWrapper);

                // --- 2. WRAPPER KANAN/BAWAH (TOMBOL AKSI) ---
                const actionsDiv = document.createElement("div");
                actionsDiv.className = "flex flex-row md:flex-col gap-2 w-full md:w-auto md:min-w-[120px] justify-end md:justify-center mt-2 md:mt-0 border-t md:border-t-0 md:border-l border-gray-100 pt-2 md:pt-0 md:pl-4";

                let hasAction = false;

                // Tombol Batalkan
                if (currentStatus === 'DIAJUKAN') {
                    const cancelBtn = createActionButton('Batalkan', 'bg-red-600 text-white hover:bg-red-700 shadow-md border border-red-700', 'fas fa-times', async () => {
                        if (confirm('Batalkan pengajuan ini?')) {
                            await handleCancel(item.id);
                        }
                    });
                    actionsDiv.appendChild(cancelBtn);
                    hasAction = true;
                }

                // Tombol Invoice
                if (currentStatus === 'DIKEMBALIKAN' || currentStatus === 'HILANG' || item.fineTotal > 0) {
                    const invoiceBtn = createActionButton('Invoice', 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200', 'fas fa-file-invoice', () => {
                        generateInvoice(item);
                    });
                    actionsDiv.appendChild(invoiceBtn);
                    hasAction = true;
                }

                if (hasAction) {
                    card.appendChild(actionsDiv);
                }

                historyContainer.appendChild(card);
            });

            if (historyStatusFilter) applyStatusFilter();

        } catch (err) {
            console.error(err);
            historyContainer.innerHTML = '<p class="text-center text-red-500">Gagal memuat riwayat.</p>';
        }
    }

    // --- Helper UI Badge ---
    function getStatusBadge(status) {
        let colorClass = "bg-gray-100 text-gray-600 border-gray-200";
        if (status === 'DIAJUKAN') colorClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
        else if (status === 'DISETUJUI') colorClass = "bg-blue-100 text-blue-700 border-blue-300";
        else if (status === 'DIPINJAM') colorClass = "bg-indigo-100 text-indigo-700 border-indigo-300";
        else if (status === 'DIKEMBALIKAN') colorClass = "bg-green-100 text-green-700 border-green-300";
        else if (status === 'DITOLAK') colorClass = "bg-red-100 text-red-700 border-red-300";
        else if (status === 'DIBATALKAN') colorClass = "bg-orange-100 text-orange-700 border-orange-300";
        else if (status === 'HILANG') colorClass = "bg-gray-800 text-white border-black";

        return `<span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colorClass}">${status}</span>`;
    }

    // --- Helper Buat Tombol ---
    function createActionButton(text, classes, icon, onClick) {
        const btn = document.createElement("button");
        btn.className = `flex-1 md:flex-none w-full px-3 py-2 rounded text-xs font-bold transition flex items-center justify-center gap-2 ${classes}`;
        btn.innerHTML = `<i class="${icon}"></i> ${text}`;
        btn.onclick = (e) => { e.stopPropagation(); onClick(); };
        return btn;
    }

    // --- Helper Cancel ---
    async function handleCancel(id) {
        try {
            const res = await fetch(`/api/member/riwayat-pinjam/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (res.ok) {
                alert('Peminjaman dibatalkan');
                // Refresh data tanpa reload halaman
                const activeSearch = document.getElementById("search-input").value.trim();
                loadHistory(activeSearch);
            } else {
                alert('Gagal membatalkan.');
            }
        } catch (err) {
            console.error(err);
            alert('Kesalahan koneksi');
        }
    }

    // --- FUNGSI COPY ID (Global) ---
    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Toast sederhana atau alert
            const toast = document.createElement("div");
            toast.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded shadow-lg text-sm z-50 animate-bounce";
            toast.innerText = "ID Disalin: " + text;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }).catch(err => {
            console.error('Gagal menyalin', err);
        });
    }


    // ==========================================
    // 3. FILTER LOGIC
    // ==========================================
    const filterButtons = document.querySelectorAll("#jenis-pinjam-options button");

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Update UI Button active
            filterButtons.forEach(b => {
                b.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-100");
                b.classList.add("bg-gray-200");
            });
            btn.classList.add("ring-2", "ring-indigo-500", "bg-indigo-100");
            btn.classList.remove("bg-gray-200");

            historyStatusFilter = btn.dataset.status || "";

            // Efek loading halus
            historyContainer.classList.add("opacity-0");
            loadHistory(searchInput.value.trim());

            setTimeout(() => {
                applyStatusFilter();
                historyContainer.classList.remove("opacity-0");
            }, 150);
        });
    });

    function applyStatusFilter() {
        const cards = historyContainer.querySelectorAll("div[data-status]");
        cards.forEach(card => {
            const status = card.getAttribute("data-status");
            if (historyStatusFilter === "" || status === historyStatusFilter) {
                card.classList.remove("hidden");
                card.classList.add("flex"); // Pastikan kembali ke display flex
            } else {
                card.classList.add("hidden");
                card.classList.remove("flex");
            }
        });
    }


    // ==========================================
    // 4. TAB & SEARCH HANDLING
    // ==========================================
    function resetTabs() {
        ebookBtn.classList.remove("border-indigo-600", "text-indigo-600");
        historyBtn.classList.remove("border-indigo-600", "text-indigo-600");
        bookContainer.classList.add("hidden");
        historyContainer.classList.add("hidden");
    }

    function activateTab(tab) {
        resetTabs();

        if (tab === 'ebook') {
            activeTab = 'ebook';
            ebookBtn.classList.add("border-indigo-600", "text-indigo-600");
            searchInput.placeholder = "Masukan Judul Buku atau Genre...";
            bookContainer.classList.remove("hidden");
            filterOptions.classList.add("hidden");

            loadBooks(searchInput.value.trim());
        }
        else if (tab === 'history') {
            activeTab = 'history';
            historyBtn.classList.add("border-indigo-600", "text-indigo-600");
            searchInput.placeholder = "Cari Berdasarkan ID Transaksi...";
            historyContainer.classList.remove("hidden");
            filterOptions.classList.remove("hidden");

            // Efek load awal
            historyContainer.classList.add("opacity-0");
            loadHistory(searchInput.value.trim());
            setTimeout(() => {
                applyStatusFilter();
                historyContainer.classList.remove("opacity-0");
            }, 150);
        }
    }

    ebookBtn.addEventListener('click', () => activateTab('ebook'));
    historyBtn.addEventListener('click', () => activateTab('history'));

    function performSearch() {
        if (activeTab === 'ebook') loadBooks(searchInput.value.trim());
        else if (activeTab === 'history') loadHistory(searchInput.value.trim());
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(); });

    // Init Load
    activateTab('ebook');
});


// ==========================================
// 5. GENERATE INVOICE PDF (Rapi & Lengkap)
// ==========================================
async function generateInvoice(item) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper Date & Rupiah
    const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : "-";
    const formatRupiah = (num) => "Rp " + Number(num).toLocaleString("id-ID");

    // Header Biru
    doc.setFillColor(79, 70, 229); // Indigo
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("INVOICE PEMINJAMAN", 14, 25);

    doc.setFontSize(10);
    doc.text("Libra | Library Area System", 14, 32);
    doc.text(`Dicetak: ${fmt(new Date())}`, pageWidth - 14, 32, { align: 'right' });

    // Detail Transaksi
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Detail Transaksi", 14, 50);

    const bodyData = [
        ["ID Transaksi", `#${item.id}`],
        ["Judul Buku", item.bookTitle],
        ["Status Akhir", item.status],
        ["Tanggal Diajukan", fmt(item.dateRequested)],
        ["Tanggal Dipinjam", fmt(item.dateBorrowed)],
        ["Batas Pengembalian", fmt(item.dateDue)],
        ["Tanggal Dikembalikan", fmt(item.dateReturned) || (item.dateLost ? `${fmt(item.dateLost)} (Hilang)` : "-")],
    ];

    doc.autoTable({
        startY: 55,
        body: bodyData,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 'auto' }
        }
    });

    // Rincian Biaya (Denda)
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text("Rincian Biaya", 14, finalY);

    const fineData = [
        ["Total Denda Keterlambatan / Ganti Rugi", formatRupiah(item.fineTotal)]
    ];

    doc.autoTable({
        startY: finalY + 5,
        head: [['Deskripsi', 'Jumlah']],
        body: fineData,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0] },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
        }
    });

    // Footer
    finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Terima kasih telah menggunakan layanan perpustakaan kami.", 14, finalY);
    doc.text("Harap simpan dokumen ini sebagai bukti.", 14, finalY + 5);

    doc.save(`Invoice_Libra_${item.id}.pdf`);
}