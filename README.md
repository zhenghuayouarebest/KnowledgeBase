# 个人技术知识库

基于 Obsidian 和 Quartz 搭建的个人在线技术知识库，支持大模型 API 集成。

## 功能特点

- ✅ 支持 Markdown 格式笔记
- ✅ 本地管理与在线发布相结合
- ✅ 集成大模型 API 增强功能
- ✅ 版本控制与备份
- ✅ 响应式设计，多设备访问

## 技术栈

- **本地管理**：Obsidian
- **在线发布**：Quartz (静态网站生成器)
- **版本控制**：Git
- **AI 集成**：OpenAI API / Claude API

## 快速开始

### 1. 环境准备

- 安装 Obsidian：[Obsidian 官网](https://obsidian.md/)
- 安装 Node.js：[Node.js 官网](https://nodejs.org/)
- 安装 Git：[Git 官网](https://git-scm.com/)

### 2. 项目设置

1. **克隆仓库**：
   ```bash
   git clone <your-repo-url> knowledgebase
   cd knowledgebase
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **安装 Quartz**：
   ```bash
   # 全局安装
   npm install -g quartz-cli
   
   # 或使用 npx
   npx quartz init
   ```

### 3. 配置 Obsidian

1. **打开 Obsidian**，选择「打开文件夹」，选择 `knowledgebase` 目录
2. **安装插件**：
   - OpenAI Plugin：接入 OpenAI API
   - Claude Plugin：接入 Claude API
   - Templater：模板管理
   - Dataview：数据查询
   - Git：版本控制

### 4. 配置大模型 API

1. **获取 API Key**：
   - OpenAI：[OpenAI 官网](https://platform.openai.com/)
   - Claude：[Anthropic 官网](https://console.anthropic.com/)

2. **在 Obsidian 插件设置中配置 API Key**

### 5. 本地管理

- 在 `content` 目录中创建和管理 Markdown 笔记
- 使用 Obsidian 的功能进行知识管理
- 定期使用 Git 提交更改：
  ```bash
  git add .
  git commit -m "更新笔记"
  git push
  ```

### 6. 在线发布

1. **构建静态网站**：
   ```bash
   quartz build
   ```

2. **部署到 GitHub Pages**：
   - 将 `public` 目录部署到 GitHub Pages
   - 或使用 Vercel、Netlify 等服务

## 目录结构

```
knowledgebase/
├── content/          # 笔记目录
├── .obsidian/        # Obsidian 配置
├── public/           # 构建输出目录
├── quartz/           # Quartz 核心代码
├── .gitignore        # Git 忽略文件
├── package.json      # 项目配置
├── quartz.config.ts  # Quartz 配置
└── README.md         # 项目说明
```

## 集成大模型 API

### 使用场景

1. **内容生成**：基于笔记内容生成摘要、扩展思路
2. **知识管理**：自动分类和标签建议、关联笔记推荐
3. **学习辅助**：解释复杂概念、生成学习问题

### 配置方法

1. **OpenAI API**：
   - 在 Obsidian 插件设置中填写 API Key
   - 选择模型（如 gpt-4、gpt-3.5-turbo）
   - 设置温度、最大 tokens 等参数

2. **Claude API**：
   - 在插件设置中配置 API Key
   - 选择 Claude 模型版本

## 安全考虑

- **API Key 保护**：避免在笔记中直接存储 API Key
- **数据隐私**：注意大模型可能会处理和存储你的笔记内容
- **成本控制**：设置合理的使用限额，避免意外的 API 费用

## 后续计划

1. 完善知识库结构
2. 集成更多 AI 功能
3. 优化网站性能
4. 添加更多技术内容

## 参考资源

- [Obsidian 官方文档](https://help.obsidian.md/)
- [Quartz 文档](https://quartz.jzhao.xyz/)
- [OpenAI API 文档](https://platform.openai.com/docs/)
- [Anthropic API 文档](https://docs.anthropic.com/)
