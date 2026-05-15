<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import html2canvas from 'html2canvas'

const A4_WIDTH = 2480
const A4_HEIGHT = 3508

const form = reactive({
  additionCount: 20,
  subtractionCount: 0,
  totalCount: 20,
  twoDigitRatio: 20,
})

const printRef = ref(null)
const questions = ref([])
const generatedQuestions = new Set()

const currentDate = computed(() => {
  const today = new Date()
  return `${today.getMonth() + 1}.${today.getDate()}`
})

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5)
}

function createQuestionKey(num1, num2, operator) {
  return `${num1}-${operator}-${num2}`
}

function addUniqueQuestion(questionsArray, key, question) {
  if (generatedQuestions.has(key)) return false
  generatedQuestions.add(key)
  questionsArray.push(question)
  return true
}

function generateAdditionQuestion() {
  let attempts = 0
  while (attempts < 200) {
    attempts += 1
    const useTwoDigit = Math.random() * 100 < form.twoDigitRatio
    let num1, num2
    if (useTwoDigit) {
      // One two-digit, one three-digit
      if (Math.random() < 0.5) {
        num1 = getRandomInt(10, 99)
        num2 = getRandomInt(100, 999)
      } else {
        num1 = getRandomInt(100, 999)
        num2 = getRandomInt(10, 99)
      }
    } else {
      num1 = getRandomInt(100, 999)
      num2 = getRandomInt(100, 999)
    }
    
    if (num1 + num2 > 1998) continue
    
    const key = createQuestionKey(num1, num2, '+')
    if (addUniqueQuestion(questions.value, key, `${num1}+${num2}=`)) {
      return true
    }
  }
  return false
}

function generateSubtractionQuestion() {
  let attempts = 0
  while (attempts < 200) {
    attempts += 1
    const useTwoDigit = Math.random() * 100 < form.twoDigitRatio
    let num1, num2
    if (useTwoDigit) {
      // One two-digit, one three-digit; ensure num1 > num2
      if (Math.random() < 0.5) {
        num1 = getRandomInt(100, 999)
        num2 = getRandomInt(10, 99)
      } else {
        num1 = getRandomInt(100, 999)
        num2 = getRandomInt(10, 99)
        if (num1 <= num2) continue
      }
    } else {
      num1 = getRandomInt(100, 999)
      num2 = getRandomInt(100, 999)
    }
    
    if (num1 <= num2) continue
    
    const key = createQuestionKey(num1, num2, '-')
    if (addUniqueQuestion(questions.value, key, `${num1}-${num2}=`)) {
      return true
    }
  }
  return false
}

function generateQuestions() {
  generatedQuestions.clear()
  questions.value = []
  
  // Generate addition questions
  for (let i = 0; i < form.additionCount; i++) {
    generateAdditionQuestion()
  }
  
  // Generate subtraction questions
  for (let i = 0; i < form.subtractionCount; i++) {
    generateSubtractionQuestion()
  }
  
  // Shuffle all questions
  questions.value = shuffle(questions.value)
}

function syncCounts() {
  if (form.additionCount + form.subtractionCount !== form.totalCount) {
    form.subtractionCount = form.totalCount - form.additionCount
  }
}

function printQuestions() {
  window.print()
}

async function downloadA4Image() {
  generateQuestions()
  const element = printRef.value
  if (!element) return

  // Temporarily hide floating controls for clean capture
  const topButtons = document.querySelector('.top-button-group')
  const controlPanel = document.querySelector('.control-panel')
  const originalTopDisplay = topButtons?.style.display
  const originalControlDisplay = controlPanel?.style.display
  if (topButtons) topButtons.style.display = 'none'
  if (controlPanel) controlPanel.style.display = 'none'

  try {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // Create A4-sized canvas and center the content
    const a4Canvas = document.createElement('canvas')
    a4Canvas.width = A4_WIDTH
    a4Canvas.height = A4_HEIGHT
    const a4Ctx = a4Canvas.getContext('2d')

    // White background
    a4Ctx.fillStyle = '#ffffff'
    a4Ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

    // Calculate scaling to fit content into A4
    const contentWidth = canvas.width
    const contentHeight = canvas.height
    const scaleX = (A4_WIDTH - 200) / contentWidth  // 100px margin each side
    const scaleY = (A4_HEIGHT - 200) / contentHeight
    const scale = Math.min(scaleX, scaleY)
    const offsetX = (A4_WIDTH - contentWidth * scale) / 2
    const offsetY = 100

    a4Ctx.drawImage(
      canvas,
      offsetX, offsetY,
      contentWidth * scale, contentHeight * scale
    )

    const today = new Date()
    const month = today.getMonth() + 1
    const day = today.getDate()
    const link = document.createElement('a')
    link.download = `竖式计算练习.png`   //-${month}${day}
    link.href = a4Canvas.toDataURL('image/png')
    link.click()
  } finally {
    // Restore floating controls
    if (topButtons) topButtons.style.display = originalTopDisplay || ''
    if (controlPanel) controlPanel.style.display = originalControlDisplay || ''
  }
}

onMounted(generateQuestions)
</script>

<template>
  <article ref="printRef" class="vertical-arithmetic" aria-label="多位数竖式加减法">
    <div class="top-button-group">
      <button class="refresh-btn" type="button" @click="generateQuestions">
        🔄 刷新题目
      </button>
      <button class="download-btn" type="button" @click="downloadA4Image">
        📥 下载图片
      </button>
      <button class="print-btn" type="button" @click="printQuestions">
        🖨️ 打印题目
      </button>
    </div>

    <header class="arithmetic-header">
      <h2>列竖式计算巩固小练习</h2> <!--（{{ currentDate }}）-->
      <!-- <div class="header-info">
        <div class="student-id-section">
          <label>学号：</label>
          <span class="info-placeholder"></span>
        </div>
        <div class="name-section">
          <label>姓名：</label>
          <span class="info-placeholder"></span>
        </div>
      </div> -->
      <div class="notes">
        <span>注意：※数位对齐</span>
        <span style="margin-left: 60px">※进位小1的位置</span>
      </div>
    </header>

    <section class="control-panel">
      <div class="control-group">
        <label for="total-count">总题数：</label>
        <input
          id="total-count"
          v-model.number="form.totalCount"
          class="count-input"
          type="number"
          min="1"
          max="40"
          @change="syncCounts"
        />
      </div>

      <div class="control-group">
        <label for="addition-count">加法：</label>
        <input
          id="addition-count"
          v-model.number="form.additionCount"
          class="count-input"
          type="number"
          min="0"
          max="40"
          @change="syncCounts"
        />
      </div>

      <div class="control-group">
        <label for="subtraction-count">减法：</label>
        <input
          id="subtraction-count"
          v-model.number="form.subtractionCount"
          class="count-input"
          type="number"
          min="0"
          max="40"
        />
      </div>
      <div class="control-group">
        <label for="two-digit-ratio">两位数比例：</label>
        <input
          id="two-digit-ratio"
          v-model.number="form.twoDigitRatio"
          class="count-input"
          type="number"
          min="0"
          max="100"
        />
        <span class="ratio-suffix">%</span>
      </div>
      <div class="note">
        说明：三位数竖式加减法（100-999），两位数比例控制其中一个数为两位数的概率，自动保证不重复
      </div>
    </section>

    <section class="questions-display">
      <div class="questions-grid">
        <div v-for="(question, index) in questions" :key="`${question}-${index}`" class="question-item">
          {{ question }}
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.vertical-arithmetic {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 30px 20px 30px;
  border-radius: 5px;
  background: #ffffff;
  color: #000000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: "Microsoft YaHei", Arial, sans-serif;
  line-height: 1.4;
}

.top-button-group {
  position: fixed;
  top: 88px;
  right: 88px;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 8px;
  border: 1px solid #d7e2ec;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(23, 32, 42, 0.12);
}

.arithmetic-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #000000;
  text-align: center;
}

.arithmetic-header h2 {
  margin: 0 0 15px;
  color: #000000;
  font-size: 2rem;
  font-weight: 700;
}

.header-info {
  display: flex;
  justify-content: center;
  gap: 80px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.student-id-section,
.name-section {
  padding-left: 20px;
  display: flex;
  align-items: baseline;
  gap: 0px;
  font-size: 1.2rem;
}

.info-placeholder {
  min-width: 70px;
  padding-bottom: 10px;
  border-bottom: 0px solid #000000;
}

.notes {
  font-size: 1.1rem;
  color: #333333;
  font-weight: 600;
}

.control-panel {
  position: fixed;
  top: 160px;
  right: 48px;
  z-index: 20;
  display: flex;
  align-items: start;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 10px 24px rgba(23, 32, 42, 0.12);
  flex-wrap: wrap;
  max-width: 425px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

label {
  font-size: 1.15rem;
  font-weight: 500;
}

input {
  padding: 8px 2px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 0.95rem;
  width:60px;
  text-align: center;
}

.note {
  margin-left: 0;
  color: #666666;
  font-size: 0.9rem;
}

.ratio-suffix {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

button {
  padding: 10px 18px;
  border: 0;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
}

.refresh-btn {
  background: #3498db;
  color: #ffffff;
}

.download-btn {
  background: #f39c12;
  color: #ffffff;
}

.print-btn {
  background: #2ecc71;
  color: #ffffff;
}

button:hover {
  opacity: 0.9;
}

.questions-display {
  margin-top: 20px;
  padding: 0;
  background: #fff;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px 50px;
  font-size: 1.5rem;
}

.question-item {
  padding: 15px 10px 140px 30px;
  font-weight: 500;
  page-break-inside: avoid;
  min-height: 140px;
}

@media (max-width: 1024px) {
  .control-panel {
    position: static;
    max-width: 100%;
    margin-bottom: 20px;
  }
  
  .questions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 10px;
  }

  .header-info {
    flex-direction: column;
    gap: 15px;
  }

  .note {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .control-panel {
    position: static;
    max-width: 100%;
  }
  
  .questions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px 10px;
  }

  .header-info {
    flex-direction: column;
    gap: 15px;
  }

  .note {
    margin-left: 0;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0.5cm 1cm;
  }

  :global(html),
  :global(body),
  :global(#app) {
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
  }

  :global(.top-bar),
  :global(.sidebar),
  .control-panel,
  .top-button-group {
    display: none !important;
  }

  :global(.page-shell),
  :global(.workspace) {
    display: block;
    min-height: auto;
    background: #ffffff !important;
  }

  :global(.content-panel) {
    overflow: visible;
    padding: 0;
    background: #ffffff !important;
  }

  .vertical-arithmetic {
    width: 100% !important;
    max-width: 100%;
    min-height: auto;
    margin: 0;
    padding: 0 !important;
    border-radius: 0;
    background: #ffffff !important;
    box-shadow: none;
    color: #000000 !important;
  }

  .arithmetic-header {
    margin-bottom: 0.4cm;
    padding-bottom: 0.3cm;
    border-bottom: 2px solid #000000;
    text-align: center;
  }

  .arithmetic-header h2 {
    margin: 0 0 0.3cm;
    font-size: 1.6rem;
  }

  .header-info {
    display: flex;
    justify-content: center;
    gap: 3cm;
    font-size: 1.1rem;
    margin-bottom: 0.2cm;
  }

  .notes {
    font-size: 0.95rem;
    text-align: left;
  }

  .questions-display {
    margin-top: 0.3cm !important;
    padding: 0 !important;
  }

  .questions-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 0.6cm 1cm !important;
    font-size: 1.4rem;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .question-item {
    padding: 0.3cm 0.2cm 2.5cm 0.5cm !important;
    min-height: 3cm !important;
    color: #000000 !important;
    font-size: 1.4rem;
    page-break-inside: avoid;
  }
}
</style>
