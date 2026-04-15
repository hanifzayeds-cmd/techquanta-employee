import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFY5Bt8t8n8dAWuP_frYRJYfGmUaWuC4k",
  authDomain: "techquantabadge.firebaseapp.com",
  projectId: "techquantabadge",
  storageBucket: "techquantabadge.firebasestorage.app",
  messagingSenderId: "63842432321",
  appId: "1:63842432321:web:9798d7270925e339fc5dc0",
  measurementId: "G-3YWSBBQ792"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Content Logic for Badges
const badgeData = {
    'rising-star': { title: 'Rising Star', icon: '⭐', class: 'tier-rising-star', impact: 'Your consistency and dedication are building a strong foundation.', awaits: "You're on a path that leads to something meaningful." },
    'excellence': { title: 'Excellence', icon: '💎', class: 'tier-excellence', impact: 'You’ve gone beyond expectations and raised the bar.', awaits: "Something remarkable is taking shape for you." },
    'legend': { title: 'Legend', icon: '👑', class: 'tier-legend', impact: 'Your contribution has left a lasting mark.', awaits: "A defining moment awaits you." }
};

const loginSec = document.getElementById('loginSection');
const dashSec = document.getElementById('dashboardSection');
let badgeListener = null;

// Auth State & Real-time Live Updates
onAuthStateChanged(auth, async (user) => {
    if (user) {
        loginSec.style.display = 'none';
        dashSec.style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'block';
        
        // Fetch User Name
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if(userDoc.exists()) {
            document.getElementById('welcomeText').innerText = `Welcome, ${userDoc.data().name}.`;
        }

        // START LIVE LISTENER FOR BADGES
        const q = query(collection(db, "awards"), where("userId", "==", user.uid));
        badgeListener = onSnapshot(q, (snapshot) => {
            const container = document.getElementById('badgeContainer');
            document.getElementById('badgeCount').innerText = snapshot.size;
            container.innerHTML = '';

            if (snapshot.empty) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.5; padding: 40px;">Your legacy begins soon. Awaiting your first badge.</p>';
                return;
            }

            // Sort newest first
            const awards = [];
            snapshot.forEach(doc => awards.push(doc.data()));
            awards.sort((a, b) => b.timestamp - a.timestamp);

            awards.forEach((data) => {
                const bData = badgeData[data.badgeType];
                const date = new Date(data.timestamp).toLocaleDateString();

                container.innerHTML += `
                    <div class="glass-panel badge-card ${bData.class}">
                        <div class="badge-icon">${bData.icon}</div>
                        <div class="b-title">${bData.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">Awarded on ${date}</div>
                        <div class="b-msg">"${data.message}"</div>
                        <div style="font-size: 0.9rem; margin-top: 15px;"><strong>Your Impact:</strong><br/>${bData.impact}</div>
                        <div style="font-size: 0.9rem; margin-top: 10px; color: var(--primary-accent);">🔒 ${bData.awaits}</div>
                    </div>
                `;
            });
        });

    } else {
        loginSec.style.display = 'block';
        dashSec.style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
        if(badgeListener) badgeListener(); // Stop listening if logged out
    }
});

// Login / Logout logic
document.getElementById('loginBtn').addEventListener('click', async () => {
    try {
        await signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
    } catch (e) { alert("Login failed. Check with management. (" + e.message + ")"); }
});
document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));