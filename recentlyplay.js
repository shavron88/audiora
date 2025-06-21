document.addEventListener("DOMContentLoaded", () => {
  renderUserProfile();
  renderRecentlyPlayed();

  // Player controls
  window.togglePlayPause = togglePlayPause;
  window.nextTrack = nextTrack;
  window.prevTrack = prevTrack;
  window.playLocalTrack = playLocalTrack;
  window.playAudiusNamed = playAudiusNamed;
});

function renderUserProfile() {
  const userName = localStorage.getItem("displayName") || "User";
  const userImg = localStorage.getItem("profileImage");
  const genres = JSON.parse(localStorage.getItem("userGenres") || "[]");

  const nameElement = document.getElementById("displayName");
  const imgElement = document.getElementById("profileImage");
  const genreContainer = document.getElementById("userGenres");

  if (nameElement) nameElement.innerText = `Welcome, ${userName}`;
  if (imgElement && userImg) imgElement.src = userImg;

  if (genreContainer) {
    genreContainer.innerHTML = "";
    genres.forEach(genre => {
      const span = document.createElement("span");
      span.textContent = genre;
      genreContainer.appendChild(span);
    });
  }
}

function renderRecentlyPlayed() {
  const container = document.getElementById("recentlyPlayedContainer");
  const recent = JSON.parse(localStorage.getItem("recentlyPlayed") || "[]");

  if (!recent.length) {
    container.innerHTML = "<p>No recently played tracks.</p>";
    return;
  }

  container.innerHTML = "";
  recent.forEach(track => {
    const card = document.createElement("div");
    card.className = "recent-card";

    const imageSrc =
      track.image ||
      (track.url?.replace("songs/", "images/").replace(".mp3", ".jpeg")) ||
      "images/default.jpeg";

    card.innerHTML = `
      <img src="${imageSrc}" alt="${track.title}" class="recent-img" />
      <div class="track-info">
        <h3>${track.title}</h3>
        <p>${track.artist}</p>
      </div>
    `;

    card.onclick = () => {
      if (track.type === "local") {
        const filename = track.url?.replace("songs/", "");
        if (filename) playLocalTrack(filename);
      } else if (track.type === "audius") {
        playAudiusNamed(track.query);
      }
    };

    container.appendChild(card);
  });
}

// === Stub playback functions ===
// If index.js is already handling playback, you can leave these
// or remove them if they're imported from index.js

function togglePlayPause() {
  const audio = document.getElementById("audioPlayer");
  const playBtn = document.getElementById("playPauseBtn");
  if (!audio || !playBtn) return;

  if (audio.paused) {
    audio.play();
    playBtn.textContent = "⏸️";
  } else {
    audio.pause();
    playBtn.textContent = "▶️";
  }
}

function nextTrack() {
  alert("This should be handled by index.js");
}

function prevTrack() {
  alert("This should be handled by index.js");
}

function playLocalTrack(filename) {
  alert(`Should play local: ${filename}`);
}

function playAudiusNamed(query) {
  alert(`Should play from Audius: ${query}`);
}

window.addEventListener("storage", event => {
  if (event.key === "recentlyPlayed") {
    renderRecentlyPlayed();
  }
});
