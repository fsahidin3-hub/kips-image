// ⚠️ GANTI DENGAN URL DEPLOYMENT APPS SCRIPT ANDA (URL /exec TERBARU)
// URL ini harus Anda dapatkan dari Apps Script
const PROXY_URL = "https://script.google.com/macros/s/AKfycbyD_dG3kuG1m0d3cw4-z8Av5DnATwKXDHKVe_jwFFODShJRM2H6hrWfCxvxy7Vtb4M1/exec"; 

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');

// --- FUNGSI UTAMA UNTUK MENGIRIM PESAN (MODE CHAT STABIL VIA PROXY) ---
async function kirimPesan() {
    const pesan = userInput.value.trim();
    if (pesan === "") return;

    tampilkanPesan(pesan, 'user');
    userInput.value = '';

    const loadingPesan = tampilkanPesan("AI sedang memproses...", 'ai');

    try {
        // Panggil Apps Script Proxy
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: pesan }) 
        });

        const balasan = await response.text();
        
        chatLog.removeChild(loadingPesan);

        // Hanya menampilkan teks yang dikembalikan (mengabaikan logika gambar/error lainnya)
        if (balasan.startsWith('ERROR_')) {
             tampilkanPesan(`Maaf, Proxy gagal merespons. Periksa Apps Script Anda.`, 'ai');
        } else {
             tampilkanPesan(balasan, 'ai'); 
        }

    } catch (error) {
        console.error("Kesalahan koneksi:", error);
        loadingPesan.innerText = "Maaf, terjadi kesalahan koneksi. Coba lagi.";
    } 
}

// --- FUNGSI PEMBANTU ---

function tampilkanPesan(teks, pengirim) {
    const elemenPesan = document.createElement('div');
    elemenPesan.classList.add(pengirim === 'user' ? 'pesan-user' : 'pesan-ai');
    elemenPesan.innerText = teks;
    chatLog.appendChild(elemenPesan);
    chatLog.scrollTop = chatLog.scrollHeight;
    return elemenPesan; 
}


// --- EVENT LISTENERS (Tombol dan Input) ---
document.addEventListener('DOMContentLoaded', () => {
    // Tombol Kirim (Paper plane)
    const actionSendButton = document.querySelector('.action-send-btn');
    if (actionSendButton) {
        actionSendButton.addEventListener('click', kirimPesan);
    }
    
    // Listener Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            kirimPesan();
        }
    });

    // Menonaktifkan fitur yang tidak digunakan agar tidak bentrok
    const plusButton = document.querySelector('.gemini-controls button:first-child');
    const micButton = document.querySelector('.gemini-controls button:nth-child(2)');
    if (plusButton) plusButton.style.opacity = 0.5;
    if (micButton) micButton.style.opacity = 0.5; 
});
