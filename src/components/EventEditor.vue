<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ homework: [], joy: [] })
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const activeTab = ref('homework')
const editingItems = ref({
  homework: [...props.modelValue.homework],
  joy: [...props.modelValue.joy]
})

const currentContent = ref('')
const showImageInput = ref(false)
const imageSrc = ref('')
const imageAlt = ref('')
const editorRef = ref(null)
const savedRange = ref(null)

const tabs = [
  { key: 'homework', label: '今天作业' },
  { key: 'joy', label: '今日新鲜事' }
]

const colors = [
  { name: '默认', value: '' },
  { name: '蓝色', value: '#0d6efd' },
  { name: '绿色', value: '#198754' },
  { name: '红色', value: '#dc3545' },
  { name: '橙色', value: '#fd7e14' },
  { name: '紫色', value: '#6f42c1' },
  { name: '粉色', value: '#e83e8c' }
]

function saveSelection() {
  const selection = window.getSelection()
  if (selection.rangeCount > 0) {
    savedRange.value = selection.getRangeAt(0)
  }
}

function restoreSelection() {
  if (savedRange.value) {
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(savedRange.value)
  }
}

function execCommand(command, value = null) {
  if (editorRef.value) {
    editorRef.value.focus()
    restoreSelection()
    document.execCommand(command, false, value)
    saveSelection()
    updateContent()
  }
}

function applyColor(color) {
  execCommand('foreColor', color)
}

function updateContent() {
  if (editorRef.value) {
    currentContent.value = editorRef.value.innerHTML
  }
}

function addCurrentItem() {
  if (currentContent.value.trim() === '' && !showImageInput.value) return
  if (showImageInput.value && !imageSrc.value) return
  
  if (showImageInput.value) {
    editingItems.value[activeTab.value].push({
      type: 'image',
      src: imageSrc.value,
      alt: imageAlt.value || '图片'
    })
    imageSrc.value = ''
    imageAlt.value = ''
    showImageInput.value = false
  } else {
    // Convert newlines to <br> tags for better display
    let content = currentContent.value
    
    // Ensure line breaks are preserved
    content = content.replace(/\n/g, '<br>')
    
    editingItems.value[activeTab.value].push({
      type: 'html',
      content: content
    })
    currentContent.value = ''
    if (editorRef.value) {
      editorRef.value.innerHTML = ''
    }
  }
}

function removeItem(index) {
  editingItems.value[activeTab.value].splice(index, 1)
}

function saveData() {
  emit('update:modelValue', {
    homework: editingItems.value.homework,
    joy: editingItems.value.joy
  })
  emit('save')
}

function switchTab(tab) {
  activeTab.value = tab
}

function handleEditorInput() {
  updateContent()
}

function handleEditorKeyUp() {
  saveSelection()
}

function handleEditorMouseUp() {
  saveSelection()
}
</script>

<template>
  <div class="rich-editor">
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="editor-content">
      <div class="toolbar">
        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            @click="execCommand('bold')"
            title="加粗"
          >
            <strong>B</strong>
          </button>
          <button
            class="toolbar-btn"
            @click="execCommand('italic')"
            title="斜体"
          >
            <em>I</em>
          </button>
        </div>

        <div class="toolbar-group">
          <div class="color-picker-dropdown">
            <button class="toolbar-btn color-btn" title="文字颜色">
              🎨
            </button>
            <div class="color-options">
              <button
                v-for="color in colors"
                :key="color.value"
                class="color-option"
                :style="{ backgroundColor: color.value || '#fff', border: color.value ? 'none' : '1px solid #dee2e6' }"
                :title="color.name"
                @click="applyColor(color.value)"
              >
                <span v-if="!color.value" class="default-text">A</span>
              </button>
            </div>
          </div>
        </div>

        <div class="toolbar-group">
          <button
            class="toolbar-btn"
            :class="{ active: showImageInput }"
            @click="showImageInput = !showImageInput"
            title="插入图片"
          >
            🖼️
          </button>
        </div>
      </div>

      <template v-if="showImageInput">
        <div class="image-input-section">
          <input
            v-model="imageSrc"
            type="text"
            placeholder="输入图片路径，如：/images/202605/511.jpg"
            class="image-url-input"
          />
          <input
            v-model="imageAlt"
            type="text"
            placeholder="图片描述（可选）"
            class="image-alt-input"
          />
          <button class="add-item-btn" @click="addCurrentItem">
             添加图片
          </button>
        </div>
      </template>

      <template v-else>
        <div
          ref="editorRef"
          class="editor-area"
          contenteditable="true"
          @input="handleEditorInput"
          @keyup="handleEditorKeyUp"
          @mouseup="handleEditorMouseUp"
          @mouseup.native="handleEditorMouseUp"
          placeholder="在此输入内容...（支持选中文本后点击工具栏设置格式）"
        ></div>

        <div class="editor-actions">
          <button class="add-item-btn" @click="addCurrentItem">
            ➕ 添加到{{ activeTab === 'homework' ? '作业' : '新鲜事' }}
          </button>
        </div>
      </template>

      <div class="items-list">
        <h3>已添加的内容：</h3>
        <div class="list-items">
          <div
            v-for="(item, index) in editingItems[activeTab]"
            :key="index"
            class="list-item"
          >
            <div class="item-content">
              <div v-if="item.type === 'html'" v-html="item.content"></div>
              <img v-if="item.type === 'image'" :src="item.src" :alt="item.alt" class="preview-image" />
            </div>
            <button class="remove-item-btn" @click="removeItem(index)">🗑️ 删除</button>
          </div>
          <p v-if="editingItems[activeTab].length === 0" class="empty-hint">
            暂无内容，请添加
          </p>
        </div>
      </div>

      <button class="save-btn" @click="saveData">💾 保存到 JSON</button>
    </div>
  </div>
</template>

<style scoped>
.rich-editor {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #e9ecef;
}

.tab-btn.active {
  background: #fff;
  color: #0d6efd;
  border-bottom: 2px solid #0d6efd;
  margin-bottom: -2px;
}

.editor-content {
  padding: 1.5rem;
  max-height: 700px;
  overflow-y: auto;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-right: 1px solid #dee2e6;
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #dee2e6;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
}

.toolbar-btn:hover {
  background: #e9ecef;
  border-color: #0d6efd;
}

.toolbar-btn.active {
  background: #0d6efd;
  color: #fff;
  border-color: #0d6efd;
}

.color-picker-dropdown {
  position: relative;
}

.color-options {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.color-picker-dropdown:hover .color-options {
  display: grid;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.default-text {
  color: #333;
  font-weight: bold;
}

.editor-area {
  min-height: 200px;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.8;
  background: #fff;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-y: auto;
}

.editor-area:focus {
  outline: none;
  border-color: #0d6efd;
}

.editor-area:empty:before {
  content: attr(placeholder);
  color: #6c757d;
  pointer-events: none;
}

.editor-area :deep(br) {
  display: block;
  content: "";
  margin: 0.3em 0;
}

.editor-area :deep(div) {
  margin: 0.3em 0;
}

.editor-actions {
  margin-bottom: 2rem;
}

.image-input-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.image-url-input,
.image-alt-input {
  padding: 0.75rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 0.95rem;
}

.image-url-input:focus,
.image-alt-input:focus {
  outline: none;
  border-color: #0d6efd;
}

.add-item-btn {
  width: 100%;
  padding: 1rem;
  background: #0d6efd;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.add-item-btn:hover {
  background: #0b5ed7;
}

.items-list {
  margin-bottom: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e9ecef;
}

.items-list h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: #6c757d;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list-item {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-content {
  flex: 1;
  white-space: pre-wrap;
  line-height: 1.8;
  word-wrap: break-word;
}

.item-content :deep(br) {
  display: block;
  content: "";
  margin: 0.3em 0;
}

.item-content :deep(p) {
  margin: 0.5em 0;
  line-height: 1.8;
}

.preview-image {
  max-width: 100%;
  border-radius: 6px;
}

.remove-item-btn {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.remove-item-btn:hover {
  background: #bb2d3b;
}

.empty-hint {
  color: #6c757d;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.save-btn {
  width: 100%;
  padding: 1rem;
  background: #198754;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #157347;
}
</style>
