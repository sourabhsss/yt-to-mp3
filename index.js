const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

const app = express();
app.use(express.static('public'));


app.get('/download', (req, res) => {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid URL');
    }

    res.header('Content-Type', 'audio/mpeg');
    res.header('Content-Disposition', 'attachment; filename="audio.mp3"');

    const videoStream = ytdl(videoURL, { quality: 'highestaudio' });
    ffmpeg(videoStream)
        .setFfmpegPath(ffmpegStatic)
        .audioBitrate(128)
        .toFormat('mp3')
        .on('error', (err) => {
            console.error(err);
            res.status(500).send('Error processing your request');
        })
        .pipe(res);
});

const PORT = process.env.PORT || 3000;
app.get('/videoInfo', async (req, res) => {
    const videoURL = req.query.url;
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid URL');
    }

    try {
        const info = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(info.formats, 'audioonly');
        res.json({
            videoTitle: info.videoDetails.title,
            videoThumbnail: info.videoDetails.thumbnails[0]?.url,
            formats: formats.map(format => ({
                itag: format.itag,
                qualityLabel: format.audioQuality,
                mimeType: format.mimeType,
                size: format.contentLength || 'Unknown size'
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to retrieve video info.');
    }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
