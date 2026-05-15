# 事件编辑器使用指南

## 功能说明

事件编辑器允许您以可视化的方式创建和编辑每日的作业和新鲜事内容，支持：
- ✅ 富文本编辑（类似 Word 的编辑器）
- ✅ **字符级别**的格式设置（加粗、斜体、颜色）
- ✅ 选中文本后应用格式
- ✅ 图片插入
- ✅ 实时预览
- ✅ 一键保存

## 使用方法

### 1. 进入编辑模式
1. 在日历中选择要编辑的日期
2. 点击右上角的 **✏️ 编辑** 按钮

### 2. 添加内容

#### 添加文本内容（富文本编辑）
1. 选择标签页：**今天作业** 或 **今日新鲜事**
2. 在编辑器中输入文本内容
3. **选中文本**后，使用工具栏设置格式：
   - **B** 按钮：加粗选中的文本
   - *I* 按钮：斜体选中的文本
   - 🎨 按钮：悬停显示颜色选项，点击颜色应用到选中的文本
4. 也可以直接粘贴已格式化的文本（从微信、Word 等）
5. 点击 **➕ 添加到作业/新鲜事** 将内容添加到列表
6. 可以添加多个内容块

#### 添加图片
1. 点击 **️ 图片** 按钮
2. 输入图片路径，例如：`/images/202605/511.jpg`
3. （可选）输入图片描述
4. 点击 **添加到作业/新鲜事**

### 3. 预览和管理内容
- 在 **已添加的内容** 区域可以查看所有已添加的内容
- 点击 **️ 删除** 按钮可以删除不需要的内容
- 实时预览加粗和颜色效果

### 4. 保存数据
1. 编辑完成后，点击 **💾 保存到 JSON** 按钮
2. 系统会显示确认提示
3. 点击 **️ 查看** 按钮切换回查看模式

## 数据格式示例

编辑后的数据会按照以下 JSON 格式保存：

```json
{
  "2026-05-11": {
    "homework": [
      {
        "type": "html",
        "content": "<b style=\"color: #0d6efd\">数学：</b><br>1.自主<br>2.读口<br>今天还有<b style=\"color: #dc3545\">2.11.22.31</b>这几位同学作业还有部分没过关"
      },
      {
        "type": "image",
        "src": "/images/202605/511.jpg",
        "alt": "数学练习示例"
      }
    ],
    "joy": [
      {
        "type": "html",
        "content": "<b style=\"color: #198754\">今天在学校</b>帮助了同学，<i>老师表扬了我！</i>"
      }
    ]
  }
}
```

**新增类型说明：**
- `html` 类型：存储包含 HTML 标签的富文本内容，支持：
  - `<b>` 或 `<strong>` 加粗
  - `<i>` 或 `<em>` 斜体
  - `style="color: #xxx"` 颜色
  - `<br>` 换行
  - 其他 HTML 格式

## 注意事项

### 文本格式
- **字符级格式化**：选中文本后点击工具栏按钮，只对选中的部分应用格式
- **多格式组合**：同一段文本可以有不同的加粗和颜色
- **粘贴支持**：可以直接从微信、Word、网页等粘贴已格式化的文本
- **HTML 存储**：内容以 HTML 格式保存到 JSON，包含所有格式标签

### 图片路径
- 图片路径相对于 `public` 目录
- 确保图片文件已经上传到对应的目录
- 例如：`/images/202605/511.jpg` 对应 `public/images/202605/511.jpg`

### 当前限制
️ **重要提示**：当前版本的数据保存在浏览器内存中，刷新页面后会丢失。

要实现真正的保存功能，需要：
1. 创建后端 API 接口
2. 修改 `saveEventData` 函数，将数据发送到后端
3. 后端将数据写入对应的 JSON 文件

## 后端集成示例

如果需要实现真正的保存功能，可以创建后端 API：

```javascript
// 示例：Node.js/Express 后端
app.post('/api/events/:date', async (req, res) => {
  const { date } = req.params
  const data = req.body
  
  // 解析日期，生成文件名
  const [year, month] = date.split('-')
  const fileName = `todayEvent${year}${month}.json`
  const filePath = path.join(__dirname, 'public/json', fileName)
  
  // 读取现有数据
  let existingData = {}
  if (fs.existsSync(filePath)) {
    existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  }
  
  // 更新数据
  existingData[date] = data
  
  // 保存到文件
  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2))
  
  res.json({ success: true })
})
```

然后在组件中修改 `saveEventData` 函数：

```javascript
async function saveEventData(data) {
  const key = currentDateKey.value
  selectedEvents.value = data
  
  try {
    const response = await fetch(`/api/events/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (response.ok) {
      alert(`✅ 数据已保存到 ${key}`)
    } else {
      alert(' 保存失败')
    }
  } catch (error) {
    console.error('Save error:', error)
    alert('❌ 保存失败：' + error.message)
  }
  
  isEditMode.value = false
}
```

## 快捷操作提示

- **选中后格式化**：先用鼠标选中文本，再点击工具栏按钮应用格式
- **复制粘贴**：可以直接从微信、QQ、Word 等复制已格式化的文本到编辑器
- **保留格式**：粘贴时会保留原文本中的加粗、颜色等格式
- **拖拽调整**：可以拖拽选中文本的不同部分分别设置格式
- **预览检查**：添加后务必在预览区检查格式是否正确
- **多次添加**：可以多次添加到列表，形成多个内容块

## 常见问题

**Q: 为什么保存后刷新页面数据没了？**
A: 当前版本只在内存中保存，需要配置后端 API 才能真正保存到 JSON 文件。

**Q: 如何设置部分文本加粗或颜色？**
A: 用鼠标选中要设置的文本，然后点击工具栏的 **B** 按钮加粗，或点击 🎨 选择颜色。

**Q: 能否从微信聊天记录直接复制？**
A: 可以！直接从微信复制粘贴到编辑器，格式会被保留。如果有特殊格式，也可以手动调整。

**Q: 图片不显示怎么办？**
A: 检查图片路径是否正确，确保图片文件存在于 `public` 目录下。

**Q: 能否批量导入数据？**
A: 可以直接编辑 JSON 文件，然后手动上传到服务器。

**Q: 支持哪些 HTML 标签？**
A: 支持常用的文本格式标签：`<b>`, `<strong>`, `<i>`, `<em>`, `<span style="color:...">`, `<br>` 等。
