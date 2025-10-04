// ⚠️ GANTI DENGAN URL DEPLOYMENT APPS SCRIPT ANDA (URL /exec)
const PROXY_URL = "https://script.google.com/macros/s/AKfycbyD_dG3kuG1m0d3cw4-z8Av5DnATwKXDHKVe_jwFFODShJRM2H6hrWfCxvxy7Vtb4M1/exec"; 

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
let uploadedImageBase64 = null; 


// --- FUNGSI UTAMA UNTUK MENGIRIM PESAN (HYBRID) ---
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
            body: JSON.stringify({ prompt: pesan }) // Mengirim prompt ke Apps Script
        });

        const balasan = await response.text();
        
        chatLog.removeChild(loadingPesan);

        if (balasan.startsWith('IMAGE_URL:')) { 
            // PENTING: Mendeteksi dan Menampilkan Gambar
            const imageUrl = balasan.replace('IMAGE_URL:', '');
            tampilkanGambar(imageUrl, pesan); 
        } else if (balasan.startsWith('ERROR_') || balasan.includes('Gagal')) {
            // Menangani error dari Apps Script
            tampilkanPesan(`Terjadi kesalahan koneksi atau di server: ${balasan}`, 'ai');
        } else {
            // Teks biasa dari Gemini
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

function tampilkanGambar(urlGambar, promptText) {
    const elemenPesan = document.createElement('div');
    elemenPesan.classList.add('pesan-ai'); 
    
    // Tambahkan label gambar
    const label = document.createElement('div');
    label.innerText = `Hasil Gambar untuk: "${promptText}"`;
    label.style.marginBottom = '5px';
    label.style.fontSize = '0.9em';
    label.style.color = '#374151';
    elemenPesan.appendChild(label);

    // Tambahkan elemen gambar
    const imgElement = document.createElement('img');
    imgElement.src = urlGambar;
    imgElement.alt = promptText;
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "300px";
    imgElement.style.borderRadius = "10px";
    imgElement.style.display = "block";
    
    elemenPesan.appendChild(imgElement);
    chatLog.appendChild(elemenPesan);
    chatLog.scrollTop = chatLog.scrollHeight;
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

    // Menonaktifkan ikon-ikon yang tidak digunakan di mode ini
    const plusButton = document.querySelector('.gemini-controls button:first-child');
    const micButton = document.querySelector('.gemini-controls button:nth-child(2)');
    if (plusButton) plusButton.style.opacity = 0.5;
    if (micButton) micButton.style.opacity = 0.5; 
});
