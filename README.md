# 视频和标签实时显示系统

这是一个简单的网页，用于实时显示最新添加的视频和标签文件，来展示当前骨架信息和是否摔倒的判断。

## 功能特点

- 自动检测并显示最新添加的视频文件（.mp4 或 .mov）
- 自动检测并显示最新添加的标签文件（.txt）
- 实时更新：当有新文件添加时自动刷新显示
- 简洁的用户界面

## 安装步骤

1. 确保已安装 Node.js

2. 安装项目依赖：
```bash
npm install express ws cors
```

3. 创建必要的文件夹：
```bash
mkdir video_data
mkdir label_data
```

4. 启动服务器：
```bash
node server.js
```

5. 在浏览器中访问：
```
http://localhost:3000
```

### 使用步骤
1. 输出的骨架视频文件（.mp4 或 .mov）到`video_data` 文件夹
2. 输出的标签文件（.txt）到`label_data` 文件夹
3. 网页将自动显示最新添加的文件

P.S. 我写了两个.txt文件和.mov文件用作测试，大家可以测试可行性






## 项目结构

```
/项目根目录
    /public
        TemplateHTML.html
    /video_data
        (视频文件)
    /label_data
        (标签文件)
    server.js
    README.md
```

