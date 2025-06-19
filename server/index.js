
const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');
const app = express();

app.use(cors());
app.get('/', (req, res) => {
  res.send('Server is working!');
});
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl || !ytdl.validateURL(videoUrl)) {
    return res.status(400).send('Invalid or missing YouTube URL.');
  }

  const info = await ytdl.getInfo(videoUrl);
  const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');
  res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);

  ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' }).pipe(res);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});