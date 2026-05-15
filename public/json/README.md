# 今日事件 JSON 数据格式说明

## 文件命名规则
- 文件名格式：`todayEvent{YYYY}{MM}.json`
- 示例：2026年5月的文件名为 `todayEvent202605.json`
- 文件存放路径：`/public/json/`

## JSON 数据结构

```json
{
  "YYYY-MM-DD": {
    "homework": [
      {
        "type": "text",
        "content": [
          { "text": "文本内容", "bold": true/false }
        ]
      },
      {
        "type": "image",
        "src": "/images/图片路径.jpg",
        "alt": "图片描述"
      }
    ],
    "joy": [
      {
        "type": "text",
        "content": [
          { "text": "文本内容", "bold": true/false }
        ]
      }
    ]
  }
}
```

## 字段说明

### 日期键 (YYYY-MM-DD)
- 格式：`2026-05-12`
- 每一天的数据作为一个独立的对象

### homework (今日作业)
数组类型，包含以下两种类型的对象：

#### 文本类型 (type: "text")
- `type`: 固定为 "text"
- `content`: 数组，包含文本片段
  - `text`: 文本内容
  - `bold`: 布尔值，是否加粗（可选）
  - `color`: 文本颜色，支持十六进制颜色值如 "#0d6efd"（可选）

#### 图片类型 (type: "image")
- `type`: 固定为 "image"
- `src`: 图片路径（相对于 public 目录）
- `alt`: 图片描述文本

### joy (今日新鲜事)
数组类型，格式与 homework 相同

## 示例

```json
{
  "2026-05-12": {
    "homework": [
      {
        "type": "text",
        "content": [
          { "text": "语文：", "bold": true, "color": "#0d6efd" },
          { "text": "背诵古诗《春晓》" }
        ]
      },
      {
        "type": "image",
        "src": "/images/study1.jpg",
        "alt": "作业示例图片"
      }
    ],
    "joy": [
      {
        "type": "text",
        "content": [
          { "text": "今天在学校", "bold": true, "color": "#dc3545" },
          { "text": "帮助了同学，老师表扬了我！" }
        ]
      }
    ]
  }
}
```

## 添加新月份数据
1. 在 `/public/json/` 目录下创建新文件
2. 文件名格式：`todayEvent{YYYY}{MM}.json`
3. 按照上述 JSON 结构添加数据
4. 页面切换月份时会自动加载对应的 JSON 文件
