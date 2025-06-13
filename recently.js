alert("JS loaded");

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, displaying recent tracks...');

  const dummyTracks = [
  {
    title: "Echo Light",
    artist: "Lumen",
    cover: "https://placehold.co/100x100?text=Echo+Light"
  },
  {
    title: "Dream Runner",
    artist: "Nova Beats",
    cover: "https://placehold.co/100x100?text=Dream+Runner"
  },
  {
    title: "Levitating",
    artist: "Dua Lipa",
    cover: "https://upload.wikimedia.org/wikipedia/en/e/e1/Dua_Lipa_-_Levitating.png"
  }
];// <-- Properly closed array here

  function playTrack(track) {
    let history = JSON.parse(localStorage.getItem('recentTracks')) || [];

    history = history.filter(
      t => t.title !== track.title || t.artist !== track.artist
    );

    history.unshift({ ...track, time: Date.now() });
    history = history.slice(0, 8);

    localStorage.setItem('recentTracks', JSON.stringify(history));
    displayTracks();
  }

  function displayTracks() {
    const container = document.getElementById('recentList');
    if (!container) return;

    container.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('recentTracks')) || [];

    history.forEach(track => {
      const minsAgo = track.time
        ? Math.floor((Date.now() - track.time) / 60000)
        : "a few";

      const timeText = minsAgo === 0 || minsAgo === "a few"
        ? 'Just now'
        : `Played ${minsAgo} min ago`;

      const div = document.createElement('div');
      div.className = 'recent-card';
      div.innerHTML = `
        <img src="${track.cover}" alt="${track.title}">
        <div class="title">${track.title}</div>
        <div class="artist">${track.artist}</div>
        <div class="timestamp">${timeText}</div>
      `;
      container.appendChild(div);
    });
  }

  // Simulate playing dummy tracks (demo only)
  dummyTracks.forEach((track, i) => {
    setTimeout(() => {
      playTrack(track);
    }, i * 300);
  });

  displayTracks();
});