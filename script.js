// ⚠️ GANTI DENGAN KUNCI API GEMINI ANDA
const PROXY_URL = "https://script.google.com/macros/s/AKfycbzggyFxa-B2sZEtmdAlJV2IeG8tldO0xpeyuvt59cdP55BnZNICORJf31wyQoKWabA6yA/exec";

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const fileInput = document.getElementById('file-input');
const imagePreview = document.getElementById('image-preview');
let uploadedImageBase64 = null; // Variabel untuk menyimpan gambar Base64

// --- FUNGSI UTAMA UNTUK MENGIRIM PESAN ---
async function kirimPesan() {
  const pesan = userInput.value.trim();
  if (pesan === "" && uploadedImageBase64 === null) return;
  
  // Tampilkan pesan user
  tampilkanPesan(pesan + (uploadedImageBase64 ? " [Gambar Terlampir]" : ""), 'user', uploadedImageBase64);
  userInput.value = '';
  
  const loadingPesan = tampilkanPesan("Kips sedang mengetik...", 'ai');
  
  // 1. Siapkan konten untuk API
  const contents = [{
    role: "user",
    parts: []
  }];
  
  // Tambahkan gambar (jika ada)
  if (uploadedImageBase64) {
    contents[0].parts.push({
      inlineData: {
        mimeType: fileInput.files[0].type,
        data: uploadedImageBase64
      }
    });
  }
  
  // Tambahkan teks (jika ada)
  if (pesan) {
    contents[0].parts.push({ text: pesan });
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: contents })
    });
    
    const data = await response.json();
    
    chatLog.removeChild(loadingPesan);
    
    let balasanAI = "Maaf, terjadi kesalahan saat menghubungi Kips. Periksa koneksi Anda.";
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts[0].text) {
      balasanAI = data.candidates[0].content.parts[0].text;
    }
    
    tampilkanPesan(balasanAI, 'ai');
    
  } catch (error) {
    console.error("Kesalahan Kips:", error);
    loadingPesan.innerText = "Maaf, terjadi kesalahan (Koneksi).";
  } finally {
    // Reset status unggah file setelah pengiriman
    resetImageUpload();
  }
}

// --- FUNGSI PEMBANTU ---

// Fungsi untuk mengkonversi file gambar menjadi Base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

// Fungsi untuk mereset tampilan dan data gambar
function resetImageUpload() {
  uploadedImageBase64 = null;
  fileInput.value = '';
  imagePreview.style.display = 'none';
}

function tampilkanPesan(teks, pengirim, base64Image = null) {
  const elemenPesan = document.createElement('div');
  elemenPesan.classList.add(pengirim === 'user' ? 'pesan-user' : 'pesan-ai');
  
  if (base64Image) {
    const imgElement = document.createElement('img');
    imgElement.src = `data:${fileInput.files[0].type};base64,${base64Image}`;
    imgElement.alt = "Uploaded Image";
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "200px";
    imgElement.style.borderRadius = "10px";
    imgElement.style.marginBottom = "8px";
    imgElement.style.display = "block";
    elemenPesan.appendChild(imgElement);
  }
  
  const textNode = document.createTextNode(teks);
  elemenPesan.appendChild(textNode);
  
  chatLog.appendChild(elemenPesan);
  chatLog.scrollTop = chatLog.scrollHeight;
  return elemenPesan;
}


// --- EVENT LISTENERS (Menghubungkan Tombol) ---
document.addEventListener('DOMContentLoaded', () => {
  const plusButton = document.querySelector('.gemini-controls button:first-child');
  const removeImageButton = document.getElementById('remove-image');
  
  // Hubungkan tombol + ke input file
  if (plusButton) {
    plusButton.addEventListener('click', () => {
      fileInput.click();
    });
  }
  
  // Hubungkan tombol X (remove)
  removeImageButton.addEventListener('click', (e) => {
    e.stopPropagation();
    resetImageUpload();
  });
  
  // Listener saat file dipilih
  fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
      try {
        // Tampilkan ikon preview
        imagePreview.style.display = 'flex';
        // Konversi dan simpan Base64
        uploadedImageBase64 = await fileToBase64(fileInput.files[0]);
      } catch (error) {
        alert("Gagal memproses gambar.");
        resetImageUpload();
      }
    }
  });
  
  // Listener Enter
  userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      kirimPesan();
    }
  });
});
// --- LOGIKA SPEECH-TO-TEXT UNTUK TOMBOL MIKROFON ---
if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  
  // Setel bahasa ke Bahasa Indonesia atau bahasa pilihan lain
  recognition.lang = 'id-ID';
  recognition.continuous = false; // Berhenti setelah selesai bicara
  recognition.interimResults = false; // Hanya berikan hasil akhir
  
  const micButton = document.querySelector('.gemini-controls button:nth-child(2)'); // Tombol Mikrofon di kontrol kiri
  
  micButton.addEventListener('click', () => {
    try {
      recognition.start();
      micButton.style.color = 'red'; // Indikasi bahwa rekaman dimulai
      micButton.title = 'Mendengarkan...';
    } catch (error) {
      // Error ini sering terjadi jika Anda mengklik terlalu cepat
      alert("Maaf, perekaman gagal dimulai. Coba lagi.");
    }
  });
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript; // Masukkan teks ke kolom input
  };
  
  recognition.onend = () => {
    micButton.style.color = '#4c51bf'; // Kembalikan warna biru
    micButton.title = 'Mikrofon';
  };
  
  recognition.onerror = (event) => {
    micButton.style.color = '#4c51bf';
    micButton.title = 'Mikrofon';
    console.error('Speech recognition error', event);
    if (event.error === 'not-allowed') {
      alert("Akses mikrofon ditolak. Izinkan akses di pengaturan browser.");
    }
  };
} else {
  // Beri tahu pengguna jika browser tidak mendukung
  document.querySelector('.gemini-controls button:nth-child(2)').style.display = 'none';
  console.log("Web Speech API tidak didukung di browser ini.");
}
