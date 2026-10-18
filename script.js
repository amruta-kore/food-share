// script.js – Simple client‑side logic for FoodShare

// Utility to manage localStorage arrays
function getArray(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}
function setArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// Toggle sections based on role selection
const donorBtn = document.getElementById('donorBtn');
const recipientBtn = document.getElementById('recipientBtn');
const donorSection = document.getElementById('donorSection');
const recipientSection = document.getElementById('recipientSection');

donorBtn.addEventListener('click', () => {
  donorSection.classList.remove('hidden');
  recipientSection.classList.add('hidden');
});

recipientBtn.addEventListener('click', () => {
  recipientSection.classList.remove('hidden');
  donorSection.classList.add('hidden');
});

// ---------- Donor flow ----------
const donorForm = document.getElementById('donorForm');

donorForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const donation = {
    name: donorForm.donorName.value.trim(),
    location: donorForm.donorLocation.value.trim().toLowerCase(),
    item: donorForm.donorItem.value.trim(),
    date: donorForm.donorDate.value,
    id: Date.now(),
  };
  const donations = getArray('foodshare_donations');
  donations.push(donation);
  setArray('foodshare_donations', donations);
  alert('Thank you! Your donation is now visible to seekers.');
  donorForm.reset();
});

// ---------- Recipient flow ----------
const recipientForm = document.getElementById('recipientForm');
const matchesDiv = document.getElementById('matches');

recipientForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const need = {
    name: recipientForm.recipientName.value.trim(),
    location: recipientForm.recipientLocation.value.trim().toLowerCase(),
    request: recipientForm.recipientNeed.value.trim(),
  };

  const donations = getArray('foodshare_donations');
  // Simple matching – same location (case‑insensitive)
  const filtered = donations.filter(d => d.location === need.location);

  matchesDiv.innerHTML = '';
  if (filtered.length === 0) {
    matchesDiv.innerHTML = `<p class="match-item">No offers found near ${need.location}. Please check back later.</p>`;
    return;
  }

  filtered.forEach(d => {
    const el = document.createElement('div');
    el.className = 'match-item';
    el.innerHTML = `<strong>${d.item}</strong> offered by <em>${d.name}</em> (available ${d.date})`;
    matchesDiv.appendChild(el);
  });
});

// Optional: expose data for debugging
window.FoodShare = { getArray, setArray };
