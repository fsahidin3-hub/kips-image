// ⚠️ GANTI DENGAN URL DEPLOYMENT APPS SCRIPT ANDA (URL /exec TERBARU)
const PROXY_URL = "https://script.google.com/macros/s/AKfycbyD_dG3kuG1m0d3cw4-z8Av5DnATwKXDHKVe_jwFFODShJRM2H6hrWfCxvxy7Vtb4M1/exec"; 

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
let uploadedImageBase64 = null; 

// --- FUNGSI UTAMA UNTUK MENGIRIM PESAN (HYBRID) ---
async function kirimPesan() {
    const pesan = userInput.value.trim();
    if (pesan === "" && uploadedImageBase64 === null) return;

    tampilkanPesan(pesan, 'user');
    userInput.value = '';

    const loadingPesan = tampilkanPesan("AI sedang memproses...", 'ai');

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: pesan }) 
        });

        const balasan = await response.text();
        
        chatLog.removeChild(loadingPesan);

        if (balasan.startsWith('IMAGE_URL:')) { 
            // Jika proxy mengembalikan URL gambar dari Google Search
            const imageUrl = balasan.replace('IMAGE_URL:', '');
            tampilkanGambar(imageUrl, pesan); 
        } else if (balasan.startsWith('ERROR_')) {
            tampilkanPesan(`Terjadi kesalahan: ${balasan}`, 'ai');
        } else {
            // Teks biasa dari Gemini
            tampilkanPesan(balasan, 'ai'); 
        }

    } catch (error) {
        console.error("Kesalahan koneksi:", error);
        loadingPesan.innerText = "Maaf, terjadi kesalahan koneksi. Coba lagi.";
    } finally {
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


// --- EVENT LISTENERS (Menghubungkan Tombol) ---
document.addEventListener('DOMContentLoaded', () => {
    const plusButton = document.querySelector('.gemini-controls button:first-child');
    const micButton = document.querySelector('.gemini-controls button:nth-child(2)');
    const sendButton = document.querySelector('.action-send-btn'); // Tombol Kirim utama
    
    // Nonaktifkan tombol Kirim yang ada di dalam input wrapper (jika ada)
    const sendButtonInside = document.querySelector('.input-send-btn');
    if (sendButtonInside) sendButtonInside.style.pointerEvents = 'none';

    // Event listener untuk tombol Kirim (Paper plane)
    if (sendButton) {
        sendButton.addEventListener('click', kirimPesan);
    }
    
    // Listener Enter
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            kirimPesan();
        }
    });

    // Logika speech-to-text (Mikrofon) - Biarkan tetap ada
    if ('webkitSpeechRecognition' in window) {
        // ... (kode speech recognition lama Anda) ...
    }
    
    // Nonaktifkan tombol + karena kita fokus pada mode hybrid search/chat
    if (plusButton) plusButton.style.opacity = 0.5;
    if (micButton) micButton.style.opacity = 1; 

    // PENTING: Jika tombol Kirim adalah yang di luar (.action-send-btn), pastikan ini terhubung
    const actionSendButton = document.querySelector('.action-send-btn');
    if (actionSendButton) {
        actionSendButton.addEventListener('click', kirimPesan);
    }
});
