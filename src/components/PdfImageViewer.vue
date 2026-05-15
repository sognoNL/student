<template>
  <article v-if="pdf" class="pdf-viewer">
    <!-- 顶部工具栏 -->
    <div class="pdf-toolbar">
      <div>
        <p class="eyebrow">{{ subtitle }}</p>
        <h2>{{ pdf.title }}</h2>
      </div>

      <div class="actions">
        <button @click="openNewWindow">新窗口打开</button>
        <button @click="printPdf">打印</button>
        <button @click="downloadPdf">另存为</button>
      </div>
    </div>

    <!-- 图片内容 -->
    <div class="pdf-image-list">
      <img
        v-for="(img, index) in pdf.images"
        :key="index"
        :src="img"
        class="pdf-image"
        loading="lazy"
      />
    </div>
  </article>
</template>

<script>
import { PdfViewerUtil } from "../utils/pdfViewerUtil";

export default {
  name: "PdfImageViewer",

  props: {
    // PDF 数据
    pdf: {
      type: Object,
      default: null,
    },

    // 标题副标签（比如：语文资料 / 数学资料）
    subtitle: {
      type: String,
      default: "资料",
    },
  },

  methods: {
    openNewWindow() {
      PdfViewerUtil.openNewWindow(this.pdf?.images || []);
    },

    printPdf() {
      PdfViewerUtil.print(this.pdf?.images || []);
    },

    downloadPdf() {
      PdfViewerUtil.download(this.pdf?.images || [], this.pdf?.title);
    },
  },
};
</script>

<style scoped>
.pdf-viewer {
  background: #fff;
}

.pdf-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.eyebrow {
  font-size: 12px;
  color: #888;
  margin: 0;
}

.actions button {
  margin-left: 8px;
}

.pdf-image-list {
  padding: 16px;
  background: #f5f5f5;
}

.pdf-image {
  width: 100%;
  margin-bottom: 16px;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}
</style>