// ⚠️ GANTI KUNCI API DI BAWAH INI DENGAN KUNCI API GEMINI ANDA
const GEMINI_API_KEY = "AIzaSyCYuvjJbtA5PL1uanXB30grbicSi3LR5gg";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');

// Fungsi utama untuk mengirim pesan dan memanggil API
async function kirimPesan() {
    const pesan = userInput.value.trim();
    if (pesan === "") return;

    // Tampilkan pesan user
    tampilkanPesan(pesan, 'user');
    userInput.value = '';

    // Tambahkan pesan loading
    const loadingPesan = tampilkanPesan("AI sedang mengetik...", 'ai');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // Menggunakan 'gemini-2.5-flash' untuk kecepatan
                contents: [{
                    role: "user",
                    parts: [{ text: pesan }]
                }]
            })
        });

        const data = await response.json();
        
        // Hapus pesan loading
        chatLog.removeChild(loadingPesan);

        // Ambil balasan AI
        let balasanAI = "Maaf, saya tidak menerima respons yang valid.";
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts[0].text) {
             balasanAI = data.candidates[0].content.parts[0].text;
        }

        // Tampilkan balasan AI
        tampilkanPesan(balasanAI, 'ai');

    } catch (error) {
        console.error("Kesalahan saat memanggil API Gemini:", error);
        // Ganti pesan loading dengan pesan error
        loadingPesan.innerText = "Maaf, terjadi kesalahan (Koneksi atau Kunci API).";
        loadingPesan.classList.add('pesan-ai'); // Tetap sebagai pesan AI
    }
}

// Fungsi untuk menampilkan pesan dan mengembalikan elemennya (berguna untuk loading)
function tampilkanPesan(teks, pengirim) {
    const elemenPesan = document.createElement('div');
    elemenPesan.classList.add(pengirim === 'user' ? 'pesan-user' : 'pesan-ai');
    elemenPesan.innerText = teks;
    chatLog.appendChild(elemenPesan);

    // Gulir ke pesan terbaru
    chatLog.scrollTop = chatLog.scrollHeight;
    return elemenPesan; // Mengembalikan elemen yang baru dibuat
}

// Menambahkan tombol kirim saat menekan Enter
userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        kirimPesan();
    }
});
