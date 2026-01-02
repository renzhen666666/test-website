const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 主页路由
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>调试网站</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f9f9f9;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; }
            ul { 
                list-style-type: none; 
                padding: 0;
            }
            li { 
                margin: 10px 0; 
                padding: 10px;
                background: #f0f0f0;
                border-radius: 4px;
            }
            a { 
                text-decoration: none; 
                color: #007bff;
                font-weight: bold;
            }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>调试网站</h1>
            <p>这是一个用于调试和测试的网站，包含以下功能：</p>
            <ul>
                <li><a href="/error/404">404 错误页面</a></li>
                <li><a href="/error/500">500 错误页面</a></li>
                <li><a href="/error/502">502 错误页面</a></li>
                <li><a href="/upload">静态文件上传</a></li>
                <li><a href="/test">测试页面</a></li>
            </ul>
        </div>
    </body>
    </html>
  `);
});

// 错误页面路由
app.get('/error/404', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'error', '404.html'));
});

app.get('/error/500', (req, res) => {
  res.status(500).sendFile(path.join(__dirname, 'public', 'error', '500.html'));
});

app.get('/error/502', (req, res) => {
  res.status(502).sendFile(path.join(__dirname, 'public', 'error', '502.html'));
});

// 上传页面路由
app.get('/upload', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>文件上传</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f9f9f9;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            input[type="file"] {
                width: 100%;
                padding: 10px;
            }
            button {
                background-color: #007bff;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            button:hover {
                background-color: #0056b3;
            }
            .result {
                margin-top: 20px;
                padding: 15px;
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 4px;
                display: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>文件上传</h1>
            <form id="uploadForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label for="file">选择文件:</label>
                    <input type="file" id="file" name="file" required>
                </div>
                <button type="submit">上传文件</button>
            </form>
            <div id="result" class="result"></div>
        </div>
        <script>
            document.getElementById('uploadForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData();
                const fileInput = document.getElementById('file');
                formData.append('file', fileInput.files[0]);
                
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok) {
                        document.getElementById('result').innerHTML = 
                            '<p><strong>上传成功!</strong></p>' +
                            '<p>文件URL: <a href="' + result.url + '" target="_blank">' + result.url + '</a></p>' +
                            '<p>文件名: ' + result.filename + '</p>';
                        document.getElementById('result').style.display = 'block';
                    } else {
                        document.getElementById('result').innerHTML = 
                            '<p><strong>上传失败:</strong> ' + result.error + '</p>';
                        document.getElementById('result').style.display = 'block';
                    }
                } catch (error) {
                    document.getElementById('result').innerHTML = 
                        '<p><strong>上传失败:</strong> ' + error.message + '</p>';
                    document.getElementById('result').style.display = 'block';
                }
            });
        </script>
    </body>
    </html>
  `);
});

// 处理文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有选择文件' });
  }
  
  // 返回文件的URL，使用tool.etan.fun域名
  const fileUrl = `https://tool.etan.fun/uploads/${req.file.filename}`;
  
  res.json({
    message: '文件上传成功',
    filename: req.file.filename,
    url: fileUrl,
    originalName: req.file.originalname
  });
});

// 测试页面路由
app.get('/test', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>测试页面</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 40px; 
                background-color: #f9f9f9;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color: #333; }
            .resource {
                margin: 20px 0;
                padding: 15px;
                background: #f0f0f0;
                border-radius: 4px;
            }
            img, script {
                max-width: 100%;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>测试页面</h1>
            <p>此页面包含各种资源，用于测试CDN速度和性能。</p>
            
            <div class="resource">
                <h3>图片资源测试</h3>
                <p>测试CDN加载图片的速度：</p>
                <img src="https://tool.etan.fun/test-image.jpg" alt="CDN图片测试" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'200\'><rect width=\'100%\' height=\'100%\' fill=\'%23f0f0f0\'/><text x=\'50%\' y=\'50%\' text-anchor=\'middle\' dominant-baseline=\'middle\' fill=\'%23999\'>CDN图片测试</text></svg>';">
            </div>
            
            <div class="resource">
                <h3>样式表资源测试</h3>
                <p>测试CDN加载CSS文件的速度：</p>
                <link rel="stylesheet" href="https://tool.etan.fun/test-styles.css" onerror="console.log('CSS加载失败')">
                <div style="padding: 10px; background-color: #e6f7ff; border: 1px solid #91d5ff; border-radius: 4px;">
                    这个蓝色框表示CSS可能已加载
                </div>
            </div>
            
            <div class="resource">
                <h3>脚本资源测试</h3>
                <p>测试CDN加载JavaScript文件的速度：</p>
                <script src="https://tool.etan.fun/test-script.js" onerror="console.log('JS加载失败')"></script>
                <div id="script-test-result">脚本测试结果将显示在这里</div>
                <script>
                    if (typeof testFunction !== 'undefined') {
                        document.getElementById('script-test-result').innerHTML = 'JavaScript已成功从CDN加载';
                    }
                </script>
            </div>
            
            <div class="resource">
                <h3>字体资源测试</h3>
                <p>测试CDN加载字体文件的速度：</p>
                <div style="font-family: 'TestFont', Arial, sans-serif; font-size: 24px;">
                    这是用于测试CDN字体加载的文本
                </div>
            </div>
            
            <div class="resource">
                <h3>视频资源测试</h3>
                <p>测试CDN加载视频文件的速度：</p>
                <video controls width="100%" onerror="this.innerHTML='视频加载失败'">
                    <source src="https://tool.etan.fun/test-video.mp4" type="video/mp4">
                    您的浏览器不支持视频标签。
                </video>
            </div>
            
            <div class="resource">
                <h3>JSON数据测试</h3>
                <p>测试CDN加载JSON数据的速度：</p>
                <script>
                    fetch('https://tool.etan.fun/test-data.json')
                        .then(response => response.json())
                        .then(data => {
                            console.log('JSON数据加载成功:', data);
                            const div = document.createElement('div');
                            div.innerHTML = '<p>JSON数据加载成功: ' + JSON.stringify(data) + '</p>';
                            document.querySelector('.resource:last-child').appendChild(div);
                        })
                        .catch(error => {
                            console.error('JSON加载失败:', error);
                        });
                </script>
            </div>
        </div>
    </body>
    </html>
  `);
});

// 通用错误处理中间件
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'error', '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public', 'error', '500.html'));
});

// 避免重复监听，仅在直接运行时才启动服务器
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}