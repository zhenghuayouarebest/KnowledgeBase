#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  contentDir: './content',
  outputDir: './public',
  siteTitle: '个人技术知识库',
  baseUrl: 'https://your-domain.com'
};

// 确保输出目录存在
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// 读取所有 Markdown 文件
function readMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// 解析 Markdown 文件
function parseMarkdownFile(filePath, marked) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // 解析 YAML frontmatter
  let frontmatter = {};
  let markdownContent = content;
  
  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd !== -1) {
      const frontmatterText = content.substring(3, frontmatterEnd);
      markdownContent = content.substring(frontmatterEnd + 3);
      
      // 简单解析 YAML
      frontmatterText.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          let value = match[2];
          // 处理数组
          if (value.startsWith('[') && value.endsWith(']')) {
            value = value.substring(1, value.length - 1).split(',').map(item => item.trim());
          }
          frontmatter[match[1]] = value;
        }
      });
    }
  }
  
  // 生成 HTML
  const htmlContent = marked(markdownContent);
  
  return {
    path: filePath,
    frontmatter,
    content: htmlContent
  };
}

// 生成页面
function generatePage(notes) {
  // 提取所有标签
  const allTags = new Set();
  notes.forEach(note => {
    if (note.frontmatter.tags) {
      note.frontmatter.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.siteTitle}</title>
  <style>
    :root {
      --primary-color: #000000;
      --secondary-color: #f7f7f7;
      --accent-color: #3b82f6;
      --text-color: #333333;
      --text-light: #666666;
      --border-color: #e5e5e5;
      --background-color: #ffffff;
      --card-background: #ffffff;
      --shadow: 0 1px 3px rgba(0,0,0,0.05);
      --shadow-hover: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    /* 暗黑模式 */
    @media (prefers-color-scheme: dark) {
      :root {
        --primary-color: #ffffff;
        --secondary-color: #1a1a1a;
        --accent-color: #60a5fa;
        --text-color: #e5e5e5;
        --text-light: #a0a0a0;
        --border-color: #333333;
        --background-color: #121212;
        --card-background: #1e1e1e;
        --shadow: 0 1px 3px rgba(0,0,0,0.2);
        --shadow-hover: 0 4px 12px rgba(0,0,0,0.3);
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.7;
      color: var(--text-color);
      background-color: var(--background-color);
      transition: all 0.3s ease;
    }
    
    /* 导航栏 */
    nav {
      background-color: var(--background-color);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 0;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    
    .nav-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    
    .nav-links {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    
    .nav-link {
      color: var(--text-color);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: color 0.2s ease;
      letter-spacing: -0.01em;
    }
    
    .nav-link:hover {
      color: var(--accent-color);
    }
    
    .nav-link.current {
      color: var(--accent-color);
      font-weight: 600;
    }
    
    /* 导航按钮 */
    .nav-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .nav-button {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 6px 12px;
      color: var(--text-color);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .nav-button:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }
    
    /* 头部 */
    header {
      padding: 60px 0 40px;
      text-align: center;
      background-color: var(--secondary-color);
      border-bottom: 1px solid var(--border-color);
    }
    
    .header-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 20px;
      color: var(--primary-color);
      line-height: 1.2;
      letter-spacing: -0.03em;
    }
    
    .subtitle {
      font-size: 1.1rem;
      color: var(--text-light);
      margin-bottom: 32px;
      font-weight: 400;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    /* 主容器 */
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    
    /* 搜索和筛选 */
    .filter-section {
      margin-bottom: 40px;
    }
    
    .search-container {
      margin-bottom: 32px;
    }
    
    .search-box {
      width: 100%;
      max-width: 600px;
      padding: 14px 18px;
      font-size: 14px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      outline: none;
      transition: all 0.2s ease;
      background-color: var(--secondary-color);
      color: var(--text-color);
      font-weight: 400;
    }
    
    .search-box:focus {
      border-color: var(--accent-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      background-color: var(--background-color);
    }
    
    .tags-container {
      margin-bottom: 32px;
    }
    
    .tags-header {
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--text-color);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .tag-filter {
      display: inline-block;
      background-color: var(--secondary-color);
      padding: 6px 14px;
      border: 1px solid var(--border-color);
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-color);
      letter-spacing: -0.01em;
    }
    
    .tag-filter:hover {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
    
    .tag-filter.active {
      background-color: var(--accent-color);
      color: white;
      border-color: var(--accent-color);
    }
    
    /* 笔记网格 */
    .notes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    
    .note-card {
      background-color: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 24px;
      transition: all 0.3s ease;
      box-shadow: var(--shadow);
    }
    
    .note-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      border-color: var(--accent-color);
    }
    
    .note-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--primary-color);
      text-decoration: none;
      display: block;
      line-height: 1.3;
      letter-spacing: -0.02em;
    }
    
    .note-title:hover {
      color: var(--accent-color);
    }
    
    .note-meta {
      font-size: 12px;
      color: var(--text-light);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .note-date {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .note-tags {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .tag {
      display: inline-block;
      background-color: var(--secondary-color);
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      color: var(--text-light);
      border: 1px solid var(--border-color);
      letter-spacing: -0.01em;
    }
    
    .note-content {
      margin-top: 16px;
      line-height: 1.6;
      color: var(--text-color);
      font-size: 14px;
    }
    
    /* 页脚 */
    footer {
      margin-top: 60px;
      background-color: var(--secondary-color);
      border-top: 1px solid var(--border-color);
      padding: 40px 0;
    }
    
    .footer-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .footer-logo {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      text-decoration: none;
      margin-bottom: 20px;
      letter-spacing: -0.02em;
    }
    
    .footer-links {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .footer-link {
      color: var(--text-light);
      text-decoration: none;
      font-size: 13px;
      transition: color 0.2s ease;
      letter-spacing: -0.01em;
    }
    
    .footer-link:hover {
      color: var(--accent-color);
    }
    
    .footer-copyright {
      font-size: 13px;
      color: var(--text-light);
      text-align: center;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      header {
        padding: 40px 0 30px;
      }
      
      .container {
        padding: 30px 20px;
      }
      
      .notes-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .note-card {
        padding: 20px;
      }
      
      .footer-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
      }
    }
    
    /* 加载动画 */
    .loading {
      text-align: center;
      padding: 40px 0;
      color: var(--text-light);
    }
    
    /* 空状态 */
    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: var(--text-light);
    }
    
    .empty-state h3 {
      margin-bottom: 16px;
      color: var(--text-color);
      font-size: 1.25rem;
      font-weight: 600;
    }
    
    /* 平滑滚动 */
    html {
      scroll-behavior: smooth;
    }
  </style>
</head>
<body>
  <!-- 导航栏 -->
  <nav>
    <div class="nav-container">
      <a href="/" class="logo">技术知识库</a>
      <div class="nav-links">
        <a href="/" class="nav-link current">首页</a>
        <a href="#" class="nav-link">关于</a>
        <a href="#" class="nav-link">博客</a>
        <a href="#" class="nav-link">近况</a>
        <a href="#" class="nav-link">联系</a>
      </div>
      <div class="nav-buttons">
        <button class="nav-button" id="languageToggle">English</button>
        <button class="nav-button" id="themeToggle">切换主题</button>
      </div>
    </div>
  </nav>
  
  <!-- 头部 -->
  <header>
    <div class="header-container">
      <h1>${config.siteTitle}</h1>
      <p class="subtitle">基于 Obsidian 和大模型 API 的个人技术知识库，探索技术的无限可能</p>
    </div>
  </header>
  
  <!-- 主容器 -->
  <div class="container">
    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <!-- 搜索框 -->
      <div class="search-container">
        <input type="text" class="search-box" placeholder="搜索笔记..." id="searchInput">
      </div>
      
      <!-- 标签筛选 -->
      <div class="tags-container">
        <h3 class="tags-header">标签</h3>
        <div class="tags-list">
          <span class="tag-filter active" data-tag="all">全部</span>
          ${Array.from(allTags).map(tag => `
            <span class="tag-filter" data-tag="${tag}">${tag}</span>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- 笔记网格 -->
    <div class="notes-grid" id="notesGrid">
      ${notes.map(note => `
        <div class="note-card" data-tags="${note.frontmatter.tags ? note.frontmatter.tags.join(',') : ''}">
          <h2 class="note-title">${note.frontmatter.title || path.basename(note.path, '.md')}</h2>
          <div class="note-meta">
            ${note.frontmatter.date ? `<span class="note-date">${note.frontmatter.date}</span>` : ''}
          </div>
          ${note.frontmatter.tags ? `
            <div class="note-tags">
              ${note.frontmatter.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <div class="note-content">
            ${note.content}
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <!-- 页脚 -->
  <footer>
    <div class="footer-container">
      <a href="/" class="footer-logo">技术知识库</a>
      <div class="footer-links">
        <a href="/" class="footer-link">首页</a>
        <a href="#" class="footer-link">关于</a>
        <a href="#" class="footer-link">博客</a>
        <a href="#" class="footer-link">近况</a>
        <a href="#" class="footer-link">联系</a>
      </div>
      <p class="footer-copyright">&copy; ${new Date().getFullYear()} 个人技术知识库. 保留所有权利.</p>
    </div>
  </footer>
  
  <script>
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const noteCards = document.querySelectorAll('.note-card');
      
      noteCards.forEach(card => {
        const title = card.querySelector('.note-title').textContent.toLowerCase();
        const content = card.querySelector('.note-content').textContent.toLowerCase();
        const tags = card.getAttribute('data-tags').toLowerCase();
        
        if (title.includes(searchTerm) || content.includes(searchTerm) || tags.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
    
    // 标签筛选功能
    document.querySelectorAll('.tag-filter').forEach(filter => {
      filter.addEventListener('click', function() {
        // 移除所有活跃状态
        document.querySelectorAll('.tag-filter').forEach(f => f.classList.remove('active'));
        // 添加当前活跃状态
        this.classList.add('active');
        
        const selectedTag = this.getAttribute('data-tag');
        const noteCards = document.querySelectorAll('.note-card');
        
        noteCards.forEach(card => {
          const tags = card.getAttribute('data-tags');
          if (selectedTag === 'all' || tags.includes(selectedTag)) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
    
    // 主题切换功能
    document.getElementById('themeToggle').addEventListener('click', function() {
      if (document.documentElement.classList.contains('dark-theme')) {
        document.documentElement.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      }
    });
    
    // 语言切换功能
    document.getElementById('languageToggle').addEventListener('click', function() {
      const currentText = this.textContent;
      if (currentText === 'English') {
        this.textContent = '中文';
        // 这里可以添加语言切换逻辑
      } else {
        this.textContent = 'English';
        // 这里可以添加语言切换逻辑
      }
    });
    
    // 加载保存的主题
    window.addEventListener('DOMContentLoaded', function() {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      }
    });
  </script>
</body>
</html>
  `;
  
  return html;
}

// 主函数
async function main() {
  console.log('开始构建静态网站...');
  
  // 动态导入 marked
  const { marked } = await import('marked');
  
  // 读取 Markdown 文件
  const markdownFiles = readMarkdownFiles(config.contentDir);
  console.log(`找到 ${markdownFiles.length} 个 Markdown 文件`);
  
  // 解析文件
  const notes = markdownFiles.map(filePath => parseMarkdownFile(filePath, marked));
  
  // 生成 HTML
  const html = generatePage(notes);
  
  // 写入文件
  const outputPath = path.join(config.outputDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`静态网站构建完成，输出到 ${outputPath}`);
}

// 运行主函数
main();
