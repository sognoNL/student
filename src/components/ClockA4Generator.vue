<script setup>
import { onMounted, ref } from 'vue'

const easyErrorMinutes = [5, 10, 50, 55]
const normalMinutes = [15, 20, 25, 30, 35, 40, 45]
const A4_WIDTH = 2480
const A4_HEIGHT = 3508
const CLOCK_NUMBER_INSET_BY_VALUE = {
  10: 1,
  11: 1,
  12: 1,
}
const CLOCK_NUMBER_VISUAL_Y_OFFSET = -2.5
const clocks = ref([])

function shuffle(list) {
  return [...list].sort(() => Math.random() - 1)
}

function randomHour() {
  return Math.floor(Math.random() * 12) || 12
}

function generateTimeList() {
  const times = [{ h: randomHour(), m: 0 }]
  const errorCount = Math.random() > 0.5 ? 4 : 3

  shuffle(easyErrorMinutes)
    .slice(0, errorCount)
    .forEach((m) => {
      let h = randomHour()
      if (m >= 50) h = (h % 12) + 1
      times.push({ h, m })
    })

  const restCount = 16 - times.length
  for (let i = 0; i < restCount; i += 1) {
    const m = normalMinutes[Math.floor(Math.random() * normalMinutes.length)]
    times.push({ h: randomHour(), m })
  }

  return shuffle(times)
}

function generateAllClocks() {
  clocks.value = generateTimeList()
}

function clockNumberRadius(baseRadius, value) {
  const inset = CLOCK_NUMBER_INSET_BY_VALUE[value] ?? 0
  return baseRadius * (1 - inset / 58)
}

function clockNumberVisualYOffset(clockRadius) {
  return CLOCK_NUMBER_VISUAL_Y_OFFSET * (clockRadius / 75)
}

function clockNumbers() {
  return Array.from({ length: 12 }, (_, index) => {
    const value = index + 1
    const angle = (value * 30 - 90) * (Math.PI / 180)
    const radius = clockNumberRadius(62, value)
    const centerX = 75
    const centerY = 75

    return {
      value,
      left: `${centerX + radius * Math.cos(angle) - 1.5}px`,
      top: `${centerY + radius * Math.sin(angle) + clockNumberVisualYOffset(centerX)}px`,
    }
  })
}

function hourAngle(hour, minute) {
  return (hour % 12) * 30 + minute * 0.5
}

function minuteAngle(minute) {
  return minute * 6
}

function drawClock(ctx, time, centerX, centerY, radius) {
  ctx.save()
  ctx.strokeStyle = '#000000'
  ctx.fillStyle = '#000000'
  ctx.lineCap = 'round'

  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()

  ctx.font = '700 48px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 1; i <= 12; i += 1) {
    const angle = (i * 30 - 90) * (Math.PI / 180)
    const numberRadius = clockNumberRadius(radius * 0.76, i)
    ctx.fillText(
      String(i),
      centerX + numberRadius * Math.cos(angle) - 5,
      centerY + numberRadius * Math.sin(angle) + clockNumberVisualYOffset(radius),
    )
  }

  const hourRadians = ((hourAngle(time.h, time.m) - 90) * Math.PI) / 180
  const minuteRadians = ((minuteAngle(time.m) - 90) * Math.PI) / 180

  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.lineTo(
    centerX + radius * 0.34 * Math.cos(hourRadians),
    centerY + radius * 0.34 * Math.sin(hourRadians),
  )
  ctx.stroke()

  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(centerX, centerY)
  ctx.lineTo(
    centerX + radius * 0.52 * Math.cos(minuteRadians),
    centerY + radius * 0.52 * Math.sin(minuteRadians),
  )
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(centerX, centerY, 17, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function downloadA4Image() {
  generateAllClocks()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = A4_WIDTH
  canvas.height = A4_HEIGHT

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, A4_WIDTH, A4_HEIGHT)

  ctx.fillStyle = '#000000'
  ctx.font = '700 92px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('钟面时间练习', A4_WIDTH / 2, 120)

  const pagePaddingX = 150
  const startY = 320
  const columnWidth = (A4_WIDTH - pagePaddingX * 2) / 4
  const rowHeight = 720
  const radius = 190

  clocks.value.forEach((time, index) => {
    const col = index % 4
    const row = Math.floor(index / 4)
    const centerX = pagePaddingX + columnWidth * col + columnWidth / 2
    const centerY = startY + rowHeight * row + radius

    drawClock(ctx, time, centerX, centerY, radius)

    ctx.font = '400 50px Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('_______时_______分', centerX - 220, centerY + radius + 70)
    ctx.fillText('_______：_______', centerX - 220, centerY + radius + 150)
  })

  const link = document.createElement('a')
  link.download = `钟面时间练习-${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

function printPractice() {
  window.print()
}

const numbers = clockNumbers()

onMounted(generateAllClocks)
</script>

<template>
  <article class="clock-practice" aria-label="钟面时间练习">
    <div class="practice-actions">
      <button class="action-btn primary" type="button" @click="generateAllClocks">
        随机刷新
      </button>
      <button class="action-btn" type="button" @click="downloadA4Image">
        下载
      </button>
      <button class="action-btn" type="button" @click="printPractice">
        打印
      </button>
    </div>

    <div class="practice-page">
      <h2 class="practice-title">钟面时间练习</h2>

      <div class="clock-container">
        <div
          v-for="(time, index) in clocks"
          :key="`${time.h}-${time.m}-${index}`"
          class="clock-item"
        >
          <div class="clock" aria-hidden="true">
            <span
              v-for="number in numbers"
              :key="number.value"
              class="clock-number"
              :style="{ left: number.left, top: number.top }"
            >
              {{ number.value }}
            </span>
            <span
              class="hand hour-hand"
              :style="{ transform: `rotate(${hourAngle(time.h, time.m)}deg)` }"
            />
            <span
              class="hand minute-hand"
              :style="{ transform: `rotate(${minuteAngle(time.m)}deg)` }"
            />
            <span class="clock-center" />
          </div>

          <div class="time-text">_______时_______分</div>
          <div class="time-text">_______：_______</div>
        </div>
      </div>
    </div>
  </article>
</template>
