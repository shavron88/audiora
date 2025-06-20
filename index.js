// ====== Global Variables ======
let audio, playBtn, progressBar, currentTime, totalTime, volumeSlider;
let fullPlaylist = [];
let currentTrackIndex = 0;

function waitForSongsToLoad() {
  return new Promise(resolve => {
    const check = () => {
      const cards = document.querySelectorAll(".song-card");
      if (cards.length > 0) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// ====== DOM Ready ======
document.addEventListener("DOMContentLoaded", () => {
  // DOM References
  audio = document.getElementById("audioPlayer");
  playBtn = document.getElementById("playPauseBtn");
  progressBar = document.getElementById("progressBar");
  currentTime = document.getElementById("currentTime");
  totalTime = document.getElementById("totalTime");
  volumeSlider = document.getElementById("volumeSlider");

  loadUserProfile();

waitForSongsToLoad().then(() => {
  fullPlaylist = getFullPlaylist();
  const storedTrack = JSON.parse(localStorage.getItem("currentTrack"));
  const storedIndex = Number(localStorage.getItem("currentTrackIndex"));

  if (storedTrack && fullPlaylist.length > 0) {
      currentTrackIndex = storedIndex || 0;
      const track = fullPlaylist[currentTrackIndex];

      if (track.type === "local") {
        audio.src = track.url;
      } else if (track.type === "audius") {
        getAudiusHost().then(async host => {
          const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(track.query)}`);
          const { data } = await res.json();
          if (data.length) {
            const stream = await fetch(`${host}/v1/tracks/${data[0].id}/stream?app_name=Audiora`);
            audio.src = stream.url;
          }
        });
      }
// Update player UI
      playBtn.textContent = "▶️";
      audio.addEventListener("loadedmetadata", () => {
        totalTime.textContent = formatTime(audio.duration || 0);
      });
    }
  });


  // Events
  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("loadedmetadata", setDuration);
  audio.addEventListener("ended", nextTrack);
  progressBar.addEventListener("input", seekTrack);
  volumeSlider.addEventListener("input", () => audio.volume = volumeSlider.value);

  document.getElementById("searchBtn").addEventListener("click", handleSearch);
  document.getElementById("searchInput").addEventListener("input", resetSearch);

  // Expose controls globally
  window.togglePlayPause = togglePlayPause;
  window.nextTrack = nextTrack;
  window.prevTrack = prevTrack;
  window.playLocalTrack = playLocalTrack;
  window.playYou = () => playAudiusNamed("Chase Atlantic You");
  window.playDieWithaSmile = () => playAudiusNamed("Die With a Smile Lady Gaga Bruno Mars");
  window.playBirdsOfaFeather = () => playAudiusNamed("Birds of a feather Billie Eilish");
  window.playHereWithMe = () => playAudiusNamed("Here With Me d4vd");
  window.playDoubt = () => playAudiusNamed("Doubt Twenty One Pilots");
});

// ====== User Profile Loader ======
function loadUserProfile() {
  const genres = JSON.parse(localStorage.getItem("userGenres") || "[]");
  const name = localStorage.getItem("displayName") || "User";
  const img = localStorage.getItem("profileImage");

  document.getElementById("displayName").innerText = `Welcome, ${name}`;
  if (img) document.getElementById("profileImage").src = img;

  const genreContainer = document.getElementById("userGenres");
  genres.forEach(g => {
    const span = document.createElement("span");
    span.textContent = g;
    genreContainer.appendChild(span);
  });
}

// ====== Playback Logic ======
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
  if (!fullPlaylist.length) return;
  currentTrackIndex = (currentTrackIndex + 1) % fullPlaylist.length;
  playTrack(currentTrackIndex);
}

function prevTrack() {
  if (!fullPlaylist.length) return;
  currentTrackIndex = (currentTrackIndex - 1 + fullPlaylist.length) % fullPlaylist.length;
  playTrack(currentTrackIndex);
}

function loadTrack(index) {
  fullPlaylist = getFullPlaylist();
  playTrack(index);
}

function updateProgress() {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
  }
}

function seekTrack() {
  if (audio.duration) {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
  }
}

function setDuration() {
  totalTime.textContent = formatTime(audio.duration);
}

function formatTime(time) {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

// ====== Play a Local Track ======
function playLocalTrack(filename) {
  fullPlaylist = getFullPlaylist();
  const url = `songs/${filename}`;
  const foundIndex = fullPlaylist.findIndex(track => track.url === url);
  if (foundIndex === -1) {
    alert(`Track ${filename} not found in playlist.`);
    return;
  }
  currentTrackIndex = foundIndex;
  playTrack(currentTrackIndex, false);

}

// ====== Play by query (Audius) ======
async function playAudiusNamed(query) {
  fullPlaylist = getFullPlaylist();
  const index = fullPlaylist.findIndex(track => track.query === query);
  currentTrackIndex = index >= 0 ? index : 0;
  playTrack(currentTrackIndex);
}

// ====== Play Track (Local or Audius) ======
async function playTrack(index, showError = true)
 {
  const track = fullPlaylist[index];
  if (!track || (!track.url && !track.query)) return;

  currentTrackIndex = index;

  try {
    if (track.type === "local") {
      audio.src = track.url;
      await audio.play();
    } else if (track.type === "audius") {
      const host = await getAudiusHost();
      const res = await fetch(`${host}/v1/tracks/search?query=${encodeURIComponent(track.query)}`);
      const { data } = await res.json();
      if (!data.length) return alert(`No track found for "${track.query}"`);
      const stream = await fetch(`${host}/v1/tracks/${data[0].id}/stream?app_name=Audiora`);
      audio.src = stream.url;
      await audio.play();
    }

    localStorage.setItem("currentTrack", JSON.stringify(track));
    localStorage.setItem("currentTrackIndex", currentTrackIndex);
    playBtn.textContent = "⏸️";
    addToRecentlyPlayed(track);

    } catch (err) {
    console.error(err);
    if (showError) alert("Failed to play track.");
  }

}

// ====== Add track to Recently Played ======
function addToRecentlyPlayed(track) {
  const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");
  const updated = [track, ...recent.filter(t =>
    t.title !== track.title || t.artist !== track.artist
  )];
  localStorage.setItem("recentlyPlayed", JSON.stringify(updated.slice(0, 15)));
}

// ====== Get Playlist from DOM ======
function getFullPlaylist() {
  return Array.from(document.querySelectorAll(".song-card")).map(card => {
    const onclick = card.getAttribute("onclick") || "";
    const title = card.querySelector(".song-title")?.innerText || "";
    const artist = card.querySelector(".artist-name")?.innerText || "";
    const img = card.querySelector("img")?.getAttribute("src") || "";

    if (onclick.includes("playLocalTrack")) {
      const match = onclick.match(/playLocalTrack\('(.+?)'\)/);
      return match ? { type: "local", url: `songs/${match[1]}`, title, artist, image: img } : null;
    }

    if (onclick.includes("playDieWithaSmile")) return { type: "audius", query: "Die With a Smile Lady Gaga Bruno Mars", title, artist, image: img };
    if (onclick.includes("playBirdsOfaFeather")) return { type: "audius", query: "Birds of a feather Billie Eilish", title, artist, image: img };
    if (onclick.includes("playHereWithMe")) return { type: "audius", query: "Here With Me d4vd", title, artist, image: img };
    if (onclick.includes("playDoubt")) return { type: "audius", query: "Doubt Twenty One Pilots", title, artist, image: img };
    if (onclick.includes("playAudiusTrack")) return { type: "audius", query: `${title} ${artist}`, title, artist, image: img };

    return null;
  }).filter(Boolean);
}

// ====== Audius API ======
async function getAudiusHost() {
  const res = await fetch("https://api.audius.co");
  const json = await res.json();
  return json.data[0];
}

// ====== Search ======
function handleSearch() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".song-card");
  const sections = document.querySelectorAll("section");

  let found = false;
  sections.forEach(sec => sec.style.display = "none");

  cards.forEach(card => {
    const title = card.querySelector(".song-title")?.innerText.toLowerCase() || "";
    const artist = card.querySelector(".artist-name")?.innerText.toLowerCase() || "";

    if (title.includes(query) || artist.includes(query)) {
      card.style.display = "flex";
      card.closest("section").style.display = "block";
      found = true;
    } else {
      card.style.display = "none";
    }
  });

  if (!found) alert("No results found.");
}

function resetSearch() {
  const val = document.getElementById("searchInput").value.trim();
  if (val === "") {
    document.querySelectorAll("section").forEach(s => s.style.display = "block");
    document.querySelectorAll(".song-card").forEach(c => c.style.display = "flex");
  }
}
