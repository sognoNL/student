<script setup>
import { onMounted, reactive, ref } from 'vue'

const A4_WIDTH = 2480
const A4_HEIGHT = 3508

const form = reactive({
  challengeTime: 6,
  additionCount: 10,
  subtractionCount: 10,
  multiplicationCount: 20,
  divisionCount: 20,
  writtenDivisionCount: 4,
  divisionNoRemainderCount: 1,
  divisionRemainderCount: 3,
})

const oralQuestions = ref([])
const writtenQuestions = ref([])
const infoMessage = ref('')
const isWarning = ref(false)
const generatedQuestions = new Set()

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5)
}

function createQuestionKey(operationType, num1, num2) {
  if (operationType === 1 || operationType === 3) {
    const sortedNums = [num1, num2].sort((a, b) => a - b)
    return `${operationType}-${sortedNums[0]}-${sortedNums[1]}`
  }
  return `${operationType}-${num1}-${num2}`
}

function addUniqueQuestion(questions, key, question) {
  if (generatedQuestions.has(key)) return false
  generatedQuestions.add(key)
  questions.push(question)
  return true
}

function generateAdditionQuestions(questions) {
  let generatedCount = 0
  let attempts = 0

  while (generatedCount < form.additionCount && attempts < form.additionCount * 80) {
    attempts += 1
    const num1 = getRandomInt(1, 99)
    const num2 = getRandomInt(1, 99)
    if (num1 + num2 > 100) continue

    const key = createQuestionKey(1, num1, num2)
    if (addUniqueQuestion(questions, key, `${num1} + ${num2} = `)) {
      generatedCount += 1
    }
  }
}

function generateSubtractionQuestions(questions) {
  let generatedCount = 0
  let attempts = 0

  while (generatedCount < form.subtractionCount && attempts < form.subtractionCount * 80) {
    attempts += 1
    const num1 = getRandomInt(1, 99)
    const num2 = getRandomInt(1, num1)
    if (num1 === num2) continue

    const key = createQuestionKey(2, num1, num2)
    if (addUniqueQuestion(questions, key, `${num1} - ${num2} = `)) {
      generatedCount += 1
    }
  }
}

function generateMultiplicationQuestions(questions) {
  let generatedCount = 0
  let attempts = 0

  while (
    generatedCount < form.multiplicationCount &&
    attempts < form.multiplicationCount * 80
  ) {
    attempts += 1
    const num1 = getRandomInt(2, 9)
    const num2 = getRandomInt(2, 9)
    const key = createQuestionKey(3, num1, num2)

    if (addUniqueQuestion(questions, key, `${num1} × ${num2} = `)) {
      generatedCount += 1
    }
  }
}

function generateDivisionQuestions(questions) {
  let generatedCount = 0
  let attempts = 0

  while (generatedCount < form.divisionCount && attempts < form.divisionCount * 80) {
    attempts += 1
    const divisor = getRandomInt(2, 9)
    const quotient = getRandomInt(2, 9)
    const dividend = divisor * quotient
    if (dividend > 81) continue

    const key = createQuestionKey(4, dividend, divisor)
    if (addUniqueQuestion(questions, key, `${dividend} ÷ ${divisor} = `)) {
      generatedCount += 1
    }
  }
}

function generateOralQuestions() {
  const questions = []
  generateAdditionQuestions(questions)
  generateSubtractionQuestions(questions)
  generateMultiplicationQuestions(questions)
  generateDivisionQuestions(questions)
  oralQuestions.value = shuffle(questions)
  return questions.length
}

function generateNoRemainderDivision() {
  let divisor
  let quotient
  let dividend

  do {
    divisor = getRandomInt(2, 9)
    quotient = getRandomInt(1, 9)
    dividend = divisor * quotient
  } while (dividend < 10 || dividend > 81 || dividend === divisor)

  return `${dividend} ÷ ${divisor} = `
}

function generateRemainderDivision() {
  let divisor
  let quotient
  let remainder
  let dividend

  do {
    divisor = getRandomInt(2, 9)
    quotient = getRandomInt(1, 9)
    remainder = getRandomInt(1, divisor - 1)
    dividend = divisor * quotient + remainder
  } while (dividend < 10 || dividend > 89 || dividend === divisor)

  return `${dividend} ÷ ${divisor} = `
}

function generateWrittenDivisionQuestions() {
  if (form.divisionNoRemainderCount + form.divisionRemainderCount !== form.writtenDivisionCount) {
    isWarning.value = true
    infoMessage.value =
      `笔算除法题目数量设置错误：无余数(${form.divisionNoRemainderCount}) + ` +
      `有余数(${form.divisionRemainderCount}) ≠ 总题数(${form.writtenDivisionCount})，请调整设置`
    writtenQuestions.value = []
    return 0
  }

  const questions = []
  for (let i = 0; i < form.divisionNoRemainderCount; i += 1) {
    questions.push(generateNoRemainderDivision())
  }
  for (let i = 0; i < form.divisionRemainderCount; i += 1) {
    questions.push(generateRemainderDivision())
  }

  writtenQuestions.value = shuffle(questions)
  return questions.length
}

function syncRemainderCount() {
  form.divisionRemainderCount = Math.max(
    0,
    form.writtenDivisionCount - form.divisionNoRemainderCount,
  )
}

function generateQuestions() {
  generatedQuestions.clear()
  const oralCount = generateOralQuestions()
  const writtenCount = generateWrittenDivisionQuestions()

  if (isWarning.value) return

  const totalOralCount =
    form.additionCount + form.subtractionCount + form.multiplicationCount + form.divisionCount

  isWarning.value = oralCount !== totalOralCount
  infoMessage.value =
    `已成功生成题目：\n` +
    `口算部分：${oralCount}题（加法${form.additionCount}题，减法${form.subtractionCount}题，` +
    `乘法${form.multiplicationCount}题，除法${form.divisionCount}题）\n` +
    `笔算部分：${writtenCount}题（无余数${form.divisionNoRemainderCount}题，` +
    `有余数${form.divisionRemainderCount}题）\n` +
    `总题数：${oralCount + writtenCount}题`
}

function printQuestions() {
  window.print()
}

function drawText(ctx, text, x, y, options = {}) {
  ctx.save()
  ctx.fillStyle = options.color ?? '#000000'
  ctx.font = options.font ?? '40px Arial'
  ctx.textAlign = options.align ?? 'left'
  ctx.textBaseline = options.baseline ?? 'top'
  ctx.fillText(text, x, y)
  ctx.restore()
}

function drawAnswerLine(ctx, x, y, width) {
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + width, y)
  ctx.stroke()
  ctx.restore()
}

function drawSectionTitle(ctx, title, y) {
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(150, y)
  ctx.lineTo(A4_WIDTH - 150, y)
  ctx.stroke()
  drawText(ctx, title, 150, y + 26, { font: '700 56px Arial' })
  ctx.restore()
}

function drawQuestion(ctx, question, number, x, y, fontSize = 44) {
  const numberText = `(${number})`
  drawText(ctx, numberText, x, y, { font: `700 ${fontSize - 4}px Arial` })

  const questionX = x + 78
  drawText(ctx, question, questionX, y, { font: `${fontSize}px Arial` })
  ctx.font = `${fontSize}px Arial`
  const textWidth = ctx.measureText(question).width
  drawAnswerLine(ctx, questionX + textWidth + 8, y + fontSize + 4, 118)
}

function downloadA4Image() {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = A4_WIDTH
  canvas.height = A4_HEIGHT

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

  drawText(ctx, `口算大挑战(${form.challengeTime}分钟挑战）`, A4_WIDTH / 2, 110, {
    font: '700 88px Arial',
    align: 'center',
  })

  drawText(ctx, '姓名：', 430, 250, { font: '48px Arial' })
  drawAnswerLine(ctx, 560, 305, 250)
  drawText(ctx, '答对题数：', 1500, 250, { font: '48px Arial' })
  drawAnswerLine(ctx, 1735, 305, 250)

  drawSectionTitle(ctx, '一、口算', 390)

  const contentLeft = 150
  const contentWidth = A4_WIDTH - contentLeft * 2
  const columnWidth = contentWidth / 4
  const oralStartY = 500
  const oralRowHeight = 92

  oralQuestions.value.forEach((question, index) => {
    const col = index % 4
    const row = Math.floor(index / 4)
    drawQuestion(
      ctx,
      question,
      index + 1,
      contentLeft + col * columnWidth,
      oralStartY + row * oralRowHeight,
    )
  })

  const writtenTitleY =
    oralStartY + Math.ceil(oralQuestions.value.length / 4) * oralRowHeight + 90
  drawSectionTitle(ctx, '二、笔算', writtenTitleY)

  const writtenStartY = writtenTitleY + 150
  const writtenColumnWidth = contentWidth / 2
  const writtenRowHeight = 460

  writtenQuestions.value.forEach((question, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    drawQuestion(
      ctx,
      question,
      index + 1,
      contentLeft + col * writtenColumnWidth + 70,
      writtenStartY + row * writtenRowHeight,
      52,
    )
  })

  const link = document.createElement('a')
  link.download = `口算大挑战-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(generateQuestions)
</script>

<template>
  <article class="arithmetic-generator" aria-label="口算大挑战">
    <div class="top-button-group">
      <button class="generate-btn" type="button" @click="generateQuestions">
        生成题目
      </button>
      <button class="download-btn" type="button" @click="downloadA4Image">
        下载图片
      </button>
      <button class="print-btn" type="button" @click="printQuestions">
        打印题目
      </button>
    </div>

    <header class="arithmetic-header">
      <h2>口算大挑战(<span>{{ form.challengeTime }}</span>分钟挑战）</h2>
      <div class="header-info">
        <div class="name-section">
          <label>姓名：</label>
          <span class="name-placeholder"></span>
        </div>
        <div class="time-section">
          <label for="challenge-time">挑战时间：</label>
          <input
            id="challenge-time"
            v-model.number="form.challengeTime"
            class="time-input"
            type="number"
            min="1"
            max="60"
          />
          <label for="challenge-time">分钟</label>
        </div>
        <div class="score-section">
          <label>答对题数：</label>
          <span class="score-placeholder"></span>
        </div>
      </div>
    </header>

    <section class="control-panel">
      <div class="control-group">
        <label>加法范围（结果≤100）</label>
        <div class="range-inputs">
          <input type="number" value="1" disabled />
          <span>~</span>
          <input type="number" value="99" disabled />
        </div>
        <div class="question-count-group">
          <label for="addition-count">题数：</label>
          <input
            id="addition-count"
            v-model.number="form.additionCount"
            class="count-input"
            type="number"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div class="control-group">
        <label>减法范围</label>
        <div class="range-inputs">
          <input type="number" value="1" disabled />
          <span>~</span>
          <input type="number" value="99" disabled />
        </div>
        <div class="question-count-group">
          <label for="subtraction-count">题数：</label>
          <input
            id="subtraction-count"
            v-model.number="form.subtractionCount"
            class="count-input"
            type="number"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div class="control-group">
        <label>乘法范围（九九表）</label>
        <div class="range-inputs">
          <input type="number" value="2" disabled />
          <span>~</span>
          <input type="number" value="9" disabled />
        </div>
        <div class="question-count-group">
          <label for="multiplication-count">题数：</label>
          <input
            id="multiplication-count"
            v-model.number="form.multiplicationCount"
            class="count-input"
            type="number"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div class="control-group">
        <label>除法范围（表内除法，无余数）</label>
        <div class="range-inputs">
          <input type="number" value="2" disabled />
          <span>~</span>
          <input type="number" value="9" disabled />
        </div>
        <div class="question-count-group">
          <label for="division-count">题数：</label>
          <input
            id="division-count"
            v-model.number="form.divisionCount"
            class="count-input"
            type="number"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div class="division-controls">
        <h3>笔算除法题目设置</h3>
        <div class="division-control-row">
          <div>
            <label for="written-division-count">总题数：</label>
            <input
              id="written-division-count"
              v-model.number="form.writtenDivisionCount"
              class="count-input"
              type="number"
              min="1"
              max="10"
              @change="syncRemainderCount"
            />
          </div>
          <div>
            <label for="division-no-remainder-count">无余数题数：</label>
            <input
              id="division-no-remainder-count"
              v-model.number="form.divisionNoRemainderCount"
              class="count-input"
              type="number"
              min="0"
              max="10"
              @change="syncRemainderCount"
            />
          </div>
          <div>
            <label for="division-remainder-count">有余数题数：</label>
            <input
              id="division-remainder-count"
              v-model.number="form.divisionRemainderCount"
              class="count-input"
              type="number"
              min="0"
              max="10"
            />
          </div>
        </div>
        <div class="division-note">
          注意：商的范围为1-9，表内除法，被除数必须是两位数（10-89），除数≥2
        </div>
      </div>

    </section>

    <div v-if="infoMessage" class="info-message" :class="{ warning: isWarning }">
      {{ infoMessage }}
    </div>

    <div class="section-title">一、口算</div>
    <section class="questions-container">
      <div class="questions-grid">
        <div v-for="(question, index) in oralQuestions" :key="`${question}-${index}`" class="question-item">
          <div class="question-number">({{ index + 1 }})</div>
          <div class="question">
            {{ question }}<span class="answer-space"></span>
          </div>
        </div>
      </div>
    </section>

    <div class="section-title">二、笔算</div>
    <section class="written-division-container">
      <div class="written-division-grid">
        <div
          v-for="(question, index) in writtenQuestions"
          :key="`${question}-${index}`"
          class="division-question"
        >
          <div class="question-number">({{ index + 1 }})</div>
          <div class="question">
            {{ question }}<span class="answer-space"></span>
          </div>
        </div>
      </div>
    </section>
  </article>
</template>

<style scoped>
.arithmetic-generator {
  max-width: 1000px;
  margin: 0 auto;
  padding: 78px 20px 20px;
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
  right: 48px;
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

.top-button-group .generate-btn {
  flex: 0 0 auto;
}

.arithmetic-header {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eeeeee;
  text-align: center;
}

.arithmetic-header h2 {
  margin: 0 0 12px;
  color: #000000;
  font-size: 1.8rem;
}

.header-info {
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-top: 10px;
}

.name-section,
.score-section,
.time-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}

.name-placeholder,
.score-placeholder {
  min-width: 80px;
  padding-bottom: 2px;
  text-align: center;
}

.control-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 5px;
  background: #f8f9fa;
}

.control-group {
  display: flex;
  flex-direction: column;
}

.range-inputs,
.question-count-group,
.division-control-row,
.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-inputs {
  gap: 8px;
}

.range-inputs input {
  flex: 1;
}

label {
  margin-bottom: 5px;
  font-size: 0.9rem;
  font-weight: 600;
}

input {
  padding: 8px 10px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.time-input,
.count-input {
  width: 60px;
  text-align: center;
}

.time-input {
  width: 48px;
}

.division-controls {
  grid-column: 1 / -1;
  margin-top: 10px;
  padding: 15px;
  border-left: 4px solid #007bff;
  border-radius: 4px;
  background: #e9ecef;
}

.division-controls h3 {
  margin: 0 0 10px;
  font-size: 1rem;
}

.division-note {
  margin-top: 5px;
  color: #666666;
  font-size: 0.85rem;
}

.button-group {
  grid-column: 1 / -1;
  margin-top: 10px;
}

button {
  padding: 10px 15px;
  border: 0;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.generate-btn {
  flex: 1;
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

.info-message {
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  background: #d4edda;
  color: #155724;
  white-space: pre-line;
}

.info-message.warning {
  border-color: #ffeaa7;
  background: #fff3cd;
  color: #856404;
}

.section-title {
  margin: 10px 0 5px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-top: 2px solid #000000;
  color: #000000;
  font-size: 1.2rem;
  font-weight: 700;
}

.questions-container {
  margin-top: 15px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 5px;
  font-size: 1rem;
}

.question-item {
  display: flex;
  align-items: center;
  min-height: 28px;
  padding: 4px 2px;
  page-break-inside: avoid;
}

.question-number {
  min-width: 20px;
  margin-right: 4px;
  color: #000000;
  font-size: 0.8rem;
  font-weight: 700;
}

.question {
  flex-grow: 1;
  font-size: 1rem;
  white-space: nowrap;
}

.answer-space {
  display: inline-block;
  width: 30px;
  margin-left: 2px;
  border-bottom: 1px solid #cccccc;
}

.written-division-container {
  margin-top: 2px;
}

.written-division-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 60px 20px;
}

.division-question {
  display: flex;
  align-items: center;
  min-height: 60px;
  padding: 15px 0 15px 30px;
  page-break-inside: avoid;
}

@media (max-width: 768px) {
  .questions-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .written-division-grid {
    grid-template-columns: 1fr;
    gap: 30px 0;
  }

  .header-info,
  .division-control-row {
    flex-wrap: wrap;
    gap: 16px;
  }
}

@media print {
  @page {
    size: A4 portrait;
    margin: 0.4cm;
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
  .top-button-group,
  .info-message {
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

  .arithmetic-generator {
    width: 100% !important;
    max-width: 100%;
    min-height: calc(297mm - 0.8cm);
    margin: 0;
    padding: 0;
    border-radius: 0;
    background: #ffffff !important;
    box-shadow: none;
    color: #000000 !important;
    font-size: 9px;
  }

  .arithmetic-header {
    display: block !important;
    height: 1.8cm;
    margin-bottom: 0.4cm;
    padding-bottom: 0.15cm;
  }

  .arithmetic-header h2 {
    margin-bottom: 0.15cm;
    font-size: 1.3rem;
  }

  .header-info {
    gap: 2.5cm;
    font-size: 0.95rem;
  }

  .time-section {
    display: none !important;
  }

  .section-title {
    margin: 0.3cm 0 0.15cm;
    padding-top: 0.2cm;
    padding-bottom: 0.1cm;
    border-top: 2px solid #000000 !important;
    font-size: 1.1rem;
    page-break-before: avoid;
  }

  .questions-container {
    margin-top: 0.15cm !important;
    color: #000000 !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .questions-grid {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 0.12cm;
    margin-bottom: 0.25cm !important;
    color: #000000 !important;
    font-size: 1.05rem;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .written-division-container {
    display: block !important;
    margin-top: 0.25cm !important;
    padding: 0 !important;
    border: 0 !important;
    background: #ffffff !important;
  }

  .written-division-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 3cm 0.6cm !important;
    margin-top: 0.05cm !important;
  }

  .division-question {
    min-height: 1.5cm !important;
    padding: 0.4cm 0 0.4cm 0.8cm !important;
    border: 0 !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .question-item {
    display: flex;
    align-items: center;
    min-height: 0.8cm;
    padding: 0.08cm 0.15cm;
    color: #000000 !important;
    font-size: 1.05rem;
    line-height: 1.3;
    page-break-inside: avoid;
  }

  .question-number {
    min-width: 0.8cm;
    color: #000000 !important;
    font-size: 0.9rem;
  }

  .question {
    color: #000000 !important;
    font-size: 1.05rem;
  }

  .answer-space {
    width: 1cm;
    margin-left: 0.15cm;
    border-bottom-color: #000000 !important;
  }
}
</style>
