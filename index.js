const songs = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    image: "images/sample.jpg",
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    image: "images/dua.jpg",
  },
  {
    title: "Golden Hour",
    artist: "Kacey Musgraves",
    image: "images/golden.jpg",
  }
];

let currentSongIndex = 0;
let isPlaying = false;

function updatePlayerUI() {
  const song = songs[currentSongIndex];
  document.getElementById("albumArt").src = song.image;
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songArtist").textContent = song.artist;
}

function togglePlay() {
  isPlaying = !isPlaying;
  const btn = document.getElementById("playPauseBtn");
  btn.textContent = isPlaying ? "⏸️" : "▶️";
  // Integrate actual audio play/pause here
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  updatePlayerUI();
  isPlaying = true;
  document.getElementById("playPauseBtn").textContent = "⏸️";
}

function prevSong() {
  currentSongIndex =
    (currentSongIndex - 1 + songs.length) % songs.length;
  updatePlayerUI();
  isPlaying = true;
  document.getElementById("playPauseBtn").textContent = "⏸️";
}

// Initialize
updatePlayerUI();
