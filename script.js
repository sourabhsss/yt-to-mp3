document.getElementById('convertBtn').addEventListener('click', function() {
    const url = document.getElementById('videoUrl').value;
    if (!url.trim()) {
        alert('Please enter a valid YouTube URL.');
        return;
    }
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '<div class="loader"></div> Fetching video details...';
    statusDiv.classList.add('loading');

    fetch(`/videoInfo?url=${encodeURIComponent(url)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('thumbnail').src = data.videoThumbnail;
            document.getElementById('videoTitle').textContent = data.videoTitle;
            document.getElementById('videoPreview').style.display = 'block'; // Show video preview

            const options = data.formats.map(format => `
                <button onclick="downloadAudio('${url}', ${format.itag})">
                    ${format.qualityLabel} - Size: ${formatSizeUnits(parseInt(format.size, 10))}
                </button>
            `).join('');

            document.getElementById('audioOptions').innerHTML = options;
            statusDiv.innerHTML = '';
            statusDiv.classList.remove('loading');
        })
        .catch(error => {
            console.error('Failed to fetch video info:', error);
            statusDiv.innerHTML = 'Failed to fetch video info. Please try again.';
            statusDiv.classList.remove('loading');
        });
});

function downloadAudio(url, itag) {
    const statusDiv = document.getElementById('status');
    statusDiv.innerHTML = '<div class="loader"></div> Preparing your download...';
    statusDiv.classList.add('loading');

    fetch(`/download?url=${encodeURIComponent(url)}&itag=${itag}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not OK');
            }
            return response.blob();
        })
        .then(blob => {
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = 'download.mp3';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            statusDiv.innerHTML = 'Download Ready!';
            statusDiv.classList.remove('loading');
        })
        .catch(error => {
            console.error('Failed to start download:', error);
            statusDiv.innerHTML = 'Failed to convert. Please try again.';
            statusDiv.classList.remove('loading');
        });
}

function formatSizeUnits(bytes) {
    if (bytes >= 1000000) {
        return (bytes / 1000000).toFixed(2) + ' MB';
    } else if (bytes >= 1000) {
        return (bytes / 1000).toFixed(2) + ' KB';
    } else if (bytes > 0) {
        return bytes + ' bytes';
    } else {
        return 'Unknown size';
    }
}
