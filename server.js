const express = require('express');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 启用 CORS
app.use(cors());

// 设置静态文件目录
app.use(express.static('public'));
app.use('/video_data', express.static(path.join(__dirname, 'video_data')));
app.use('/label_data', express.static(path.join(__dirname, 'label_data')));

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function notifyClients(message) {
    console.log('Notifying clients:', message);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

function getLatestFile(dir, extension) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            const matchingFiles = files.filter(file => file.endsWith(extension));
            if (matchingFiles.length === 0) {
                resolve(null);
                return;
            }
            
            // 获取所有文件的完整路径
            const filePaths = matchingFiles.map(file => path.join(dir, file));
            
            // 获取所有文件的统计信息
            Promise.all(filePaths.map(filePath => 
                new Promise((resolve, reject) => {
                    fs.stat(filePath, (err, stats) => {
                        if (err) reject(err);
                        else resolve({ path: filePath, stats });
                    });
                })
            )).then(fileStats => {
                // 按修改时间排序，最新的在前
                fileStats.sort((a, b) => b.stats.mtime - a.stats.mtime);
                // 返回最新的文件名
                resolve(path.basename(fileStats[0].path));
            }).catch(reject);
        });
    });
}

app.get('/get_latest_video', async (req, res) => {
    try {
        const videoDir = path.join(__dirname, 'video_data');
        const latestVideo = await getLatestFile(videoDir, '.mp4') || await getLatestFile(videoDir, '.mov');
        res.json({ filename: latestVideo });
    } catch (error) {
        res.status(500).send('Error getting latest video');
    }
});

app.get('/get_latest_label', async (req, res) => {
    try {
        const labelDir = path.join(__dirname, 'label_data');
        const latestLabel = await getLatestFile(labelDir, '.txt');
        res.json({ filename: latestLabel });
    } catch (error) {
        res.status(500).send('Error getting latest label');
    }
});

// 监控 video_data 文件夹
fs.watch(path.join(__dirname, 'video_data'), (eventType, filename) => {
    console.log('Video directory event:', eventType, filename);
    if (filename && (eventType === 'rename' || eventType === 'add') && 
        (filename.endsWith('.mp4') || filename.endsWith('.mov'))) {
        notifyClients('New video added');
    }
});

// 监控 label_data 文件夹
fs.watch(path.join(__dirname, 'label_data'), (eventType, filename) => {
    console.log('Label directory event:', eventType, filename);
    if (filename && (eventType === 'rename' || eventType === 'add') && filename.endsWith('.txt')) {
        notifyClients('New label added');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 