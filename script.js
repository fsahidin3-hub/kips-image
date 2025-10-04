// ⚠️ PROXY URL FINAL ANDA (SUDAH DIPERBAIKI)
const PROXY_URL = const PROXY_URL = "https://script.google.com/macros/s/AKfycbz6GCDdmni-atHh9v35AbWhHaDhR2IvJMdkBOfSuIWG6s2Y4KuJrhrooMpqB2akj8ey/exec"; 

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
            // Menampilkan Gambar dari Google Search
            const imageUrl = balasan.replace('IMAGE_URL:', '');
            tampilkanGambar(imageUrl, pesan); 
        } else if (balasan.startsWith('ERROR_') || balasan.includes('Gagal')) {
            // Menampilkan pesan error spesifik dari Apps Script
            tampilkanPesan(`SERVER ERROR: Terjadi kesalahan di server.`, 'ai');
        } else if (balasan === 'TIDAK ADA GAMBAR') {
             tampilkanPesan(`Maaf, Google Search tidak menemukan gambar yang relevan.`, 'ai');
        } else {
            // Teks biasa dari Gemini
            tampilkanPesan(balasan, 'ai'); 
        }

    } catch (error) {
        console.error("Kesalahan koneksi:", error);
        loadingPesan.innerText = "Maaf, terjadi kesalahan koneksi. (Pastikan URL proxy sudah benar dan di-deploy).";
    } finally {
        // Reset status unggah file setelah pengiriman
        resetImageUpload();
    }
}

// --- FUNGSI PEMBANTU ---

function resetImageUpload() {
    uploadedImageBase64 = null;
    if (fileInput) fileInput.value = '';
    if (imagePreview) imagePreview.style.display = 'none';
}

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
    
    const label = document.createElement('div');
    label.innerText = `Hasil Gambar untuk: "${promptText}"`;
    label.style.marginBottom = '5px';
    label.style.fontSize = '0.9em';
    label.style.color = '#374151';
    elemenPesan.appendChild(label);

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
    const actionSendButton = document.querySelector('.action-send-btn');
    const userInput = document.getElementById('user-input');

    if (actionSendButton) {
        actionSendButton.addEventListener('click', kirimPesan);
    }
    
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
