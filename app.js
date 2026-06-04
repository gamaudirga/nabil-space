import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Konfigurasi Firebase asli untuk nabil-space (Sudah include databaseURL Singapore)
const firebaseConfig = {
  apiKey: "AIzaSyD_XRqO8J6gqTa6Fowih3TkCSwJmnP7yJQ",
  authDomain: "nabil-space.firebaseapp.com",
  databaseURL: "https://nabil-space-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nabil-space",
  storageBucket: "nabil-space.firebasestorage.app",
  messagingSenderId: "1017195983918",
  appId: "1:1017195983918:web:83091fbcc4f892ff4d1bbf",
  measurementId: "G-SPVFBKYBT6"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messagesRef = ref(db, 'ucapan');

// Elemen-elemen DOM HTML
const board = document.getElementById('board');
const paperForm = document.getElementById('paperForm');
const formModal = document.getElementById('formModal');
const openFormBtn = document.getElementById('openFormBtn');
const closeFormBtn = document.getElementById('closeFormBtn');

// Fungsi Buka-Tutup Modal Form
if (openFormBtn && formModal && closeFormBtn) {
    openFormBtn.addEventListener('click', () => formModal.classList.remove('hidden'));
    closeFormBtn.addEventListener('click', () => formModal.classList.add('hidden'));
}

// Fungsi Mengirim Ucapan ke Firebase
if (paperForm) {
    paperForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('senderName');
        const messageInput = document.getElementById('messageText');
        const colorInput = document.querySelector('input[name="color"]:checked');

        const name = nameInput ? nameInput.value.trim() || "Anonymous" : "Anonymous";
        const message = messageInput ? messageInput.value.trim() : "";
        const color = colorInput ? colorInput.value : "bg-yellow-100";

        if (!message) {
            alert("Isi ucapan tidak boleh kosong!");
            return;
        }

        // Push data baru ke Firebase Database
        push(messagesRef, {
            sender: name,
            text: message,
            bgColor: color,
            timestamp: Date.now()
        }).then(() => {
            paperForm.reset();
            if (formModal) formModal.classList.add('hidden');
        }).catch((error) => {
            alert("Gagal mengirim pesan: " + error.message);
        });
    });
}

// Fungsi Menarik Data Real-time dari Firebase dan Menampilkannya ke Papan
onValue(messagesRef, (snapshot) => {
    if (!board) return;
    board.innerHTML = ""; // Bersihkan papan
    
    if (snapshot.exists()) {
        const data = snapshot.val();
        
        Object.keys(data).reverse().forEach((key) => {
            const item = data[key];
            const note = document.createElement('div');
            
            // Rotasi random biar organik
            const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2', 'rotate-0'];
            const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];
            
            note.className = `${item.bgColor || 'bg-yellow-100'} ${randomRotation} p-6 rounded-tl-xl rounded-br-3xl shadow-md border-t-4 border-amber-400 flex flex-col justify-between transition duration-300 transform hover:scale-105 hover:shadow-xl hover:z-10`;
            
            note.innerHTML = `
                <p class="handwritten text-2xl text-gray-800 leading-snug break-words mb-4">"${item.text}"</p>
                <div class="text-right text-xs font-semibold text-gray-500 border-t border-dashed border-gray-400 pt-2">
                    — From: <span class="text-amber-800">${item.sender}</span>
                </div>
            `;
            board.appendChild(note);
        });
    } else {
        board.innerHTML = `<p class="col-span-full text-center text-amber-800 italic">Belum ada ucapan nih. Yuk jadi yang pertama mengisi!</p>`;
    }
});
