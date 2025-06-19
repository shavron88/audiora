// ====== Global Variables ======
let audio;
let playBtn;
let progressBar;
let currentTime;
let totalTime;
let volumeSlider;

let currentTrackIndex = 0;
let isStreaming = false;

// Local playlist
const playlist = [
  { title: "You", artist: "Chase Atlantic", url: "tracks/you.mp3" },
  { title: "Say", artist: "keshi", url: "tracks/say.mp3" },
  { title: "Car Crash", artist: "eaJ", url: "tracks/car-crash.mp3" },
  { title: "Slide", artist: "Chase Atlantic", url: "tracks/slide.mp3" },
  { title: "Summer", artist: "Wave To Earth", url: "tracks/summer.mp3" },
  { title: "Mehram", artist: "Arooj Aftab", url: "tracks/mehram.mp3" },
  { title: "Na Milay", artist: "HAVI", url: "tracks/na-milay.mp3" },
  { title: "Timeless", artist: "The Weeknd", url: "tracks/timeless.mp3" },
  { title: "Roop", artist: "NAYEL", url: "tracks/roop.mp3" }
];

// ====== DOMContentLoaded: Initialize after DOM is ready ======
document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  audio = document.getElementById("audioPlayer");
  playBtn = document.getElementById("playPauseBtn");
  progressBar = document.getElementById("progressBar");
  currentTime = document.getElementById("currentTime");
  totalTime = document.getElementById("totalTime");
  volumeSlider = document.getElementById("volumeSlider");

  // Load user profile
  loadUserProfile();

  // Load first track
  loadTrack(currentTrackIndex);

  // Event Listeners
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", setDuration);
  audio.addEventListener("ended", nextTrack);
  progressBar.addEventListener("input", seekTrack);
  volumeSlider.addEventListener("input", changeVolume);

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("searchInput").addEventListener("input", resetSearch);

  // Expose controls to global scope
  window.togglePlayPause = togglePlayPause;
  window.nextTrack = nextTrack;
  window.prevTrack = prevTrack;
  window.playAudiusTrack = playAudiusTrack;
});

// ====== User Info Load ======
function loadUserProfile() {
  const genres = JSON.parse(localStorage.getItem("userGenres") || "[]");
  const container = document.getElementById("userGenres");
  genres.forEach(g => {
    const span = document.createElement("span");
    span.textContent = g;
    container.appendChild(span);
  });

  const userName = localStorage.getItem("displayName") || "User";
  const userImg = localStorage.getItem("profileImage");

  const nameElement = document.getElementById("displayName");
  if (nameElement) nameElement.innerText = `Welcome, ${userName}`;

  const imgElement = document.getElementById("profileImage");
  if (imgElement && userImg) imgElement.src = userImg;
}

// ====== Player Controls ======
function loadTrack(index) {
  isStreaming = false;
  if (index >= 0 && index < playlist.length) {
    const track = playlist[index];
    audio.src = track.url;
    audio.play();
    playBtn.textContent = "⏸️";
  }
}

function togglePlayPause() {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸️";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
}

function nextTrack() {
  if (isStreaming) return;
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  loadTrack(currentTrackIndex);
}

function prevTrack() {
  if (isStreaming) return;
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentTrackIndex);
}

function updateProgress() {
  if (audio.duration) {
    const value = (audio.currentTime / audio.duration) * 100;
    progressBar.value = value;
    currentTime.textContent = formatTime(audio.currentTime);
  }
}

function seekTrack() {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
}

function setDuration() {
  if (audio.duration) {
    totalTime.textContent = formatTime(audio.duration);
  }
}

function changeVolume() {
  audio.volume = volumeSlider.value;
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// ====== Audius Integration ======
async function playAudiusTrack() {
  try {
    const hostRes = await fetch('https://api.audius.co');
    const hostData = await hostRes.json();
    const host = hostData.data[0];

    const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent('Chase Atlantic')}`);
    const { data } = await res.json();
    const track = data[0];

    if (!track) return alert('No track found.');

    const streamRes = await fetch(`${host}/v1/tracks/${track.id}/stream?app_name=Audiora`);
    const streamUrl = streamRes.url;

    isStreaming = true;
    audio.src = streamUrl;
    await audio.play();
    playBtn.textContent = "⏸️";
    alert(`Now playing: "${track.title}" by ${track.user.name}`);
  } catch (err) {
    console.error(err);
    alert('Error playing Audius track.');
  }
}
async function playDieWithASmile() {
  const host = await getAudiusHost();
  const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent('Die With A Smile Lady Gaga Bruno Mars')}`);
  const { data } = await res.json();

  if (!data.length) {
    alert('No Audius track found for "Die With a Smile".');
    return;
  }
}
  async function backtofriends() {
  const host = await getAudiusHost();
  const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent('thats so')}`);
  const { data } = await res.json();

  if (!data.length) {
    alert('No Audius track found for "Back To Friends".');
    return;
  }

  const track = data[0];
  const streamRes = await fetch(`${host}/v1/tracks/${track.id}/stream?app_name=Audiora`);
  
  audio.src = streamRes.url;
  await audio.play();
  playBtn.textContent = "⏸️";
  alert(`Now playing: "${track.title}" by ${track.user.name}`);
}

// ====== Search Functionality ======
function handleSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const allSections = document.querySelectorAll("section");
  const allCards = document.querySelectorAll(".song-card");

  let matchFound = false;

  allSections.forEach(section => section.style.display = "none");

  allCards.forEach(card => {
    const title = card.querySelector(".song-title")?.textContent.toLowerCase() || '';
    const artist = card.querySelector(".artist-name")?.textContent.toLowerCase() || '';

    if (title.includes(query) || artist.includes(query)) {
      card.style.display = "flex";
      card.closest("section").style.display = "block"; // Show parent section
      matchFound = true;
    } else {
      card.style.display = "none";
    }
  });

  if (!matchFound) alert("No results found.");
}


function resetSearch() {
  const value = document.getElementById("searchInput").value.trim();
  const allSections = document.querySelectorAll("section");
  const allCards = document.querySelectorAll(".song-card");

  if (value === "") {
    allSections.forEach(section => section.style.display = "block");
    allCards.forEach(card => card.style.display = "flex");
  }
}
