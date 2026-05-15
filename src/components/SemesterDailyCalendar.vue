<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import EventEditor from './EventEditor.vue'

const today = new Date()
const viewedDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const eventData = ref({})
const loading = ref(false)
const isEditMode = ref(false)
const currentDateKey = computed(() => formatDateKey(selectedDate.value))

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const monthTitle = computed(() => {
  const year = viewedDate.value.getFullYear()
  const month = viewedDate.value.getMonth() + 1
  return `${year}年${month}月`
})

const selectedTitle = computed(() => formatDisplayDate(selectedDate.value))
const selectedKey = computed(() => formatDateKey(selectedDate.value))

const selectedEvents = computed({
  get: () => {
    return (
      eventData.value[selectedKey.value] ?? {
        homework: [
          {
            type: 'text',
            content: [{ text: '今天作业：待补充' }],
          },
        ],
        joy: [
          {
            type: 'text',
            content: [{ text: '今日份快乐：待记录' }],
          },
        ],
      }
    )
  },
  set: (value) => {
    eventData.value[selectedKey.value] = value
  }
})

const calendarDays = computed(() => {
  const year = viewedDate.value.getFullYear()
  const month = viewedDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < startOffset; i += 1) {
    days.push({ key: `blank-${i}`, day: '', date: null })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day)
    const key = formatDateKey(date)
    days.push({
      key,
      day,
      date,
      isToday: key === formatDateKey(today),
      isSelected: key === selectedKey.value,
      hasEvent: Boolean(eventData.value[key]),
    })
  }

  return days
})

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(date) {
  const week = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 星期${week}`
}

function changeMonth(delta) {
  const next = new Date(viewedDate.value)
  next.setMonth(next.getMonth() + delta)
  viewedDate.value = new Date(next.getFullYear(), next.getMonth(), 1)
}

function selectDate(day) {
  if (!day.date) return
  selectedDate.value = new Date(
    day.date.getFullYear(),
    day.date.getMonth(),
    day.date.getDate(),
  )
  isEditMode.value = false
}

// Load event data from JSON file
async function loadEventData(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const fileName = `todayEvent${year}${month}.json`
  const filePath = `/json/${fileName}`

  loading.value = true
  try {
    const response = await fetch(filePath)
    if (response.ok) {
      eventData.value = await response.json()
    } else {
      console.warn(`Event data file not found: ${filePath}`)
      eventData.value = {}
    }
  } catch (error) {
    console.error('Failed to load event data:', error)
    eventData.value = {}
  } finally {
    loading.value = false
  }
}

// Watch for month changes to reload data
watch(viewedDate, (newDate) => {
  loadEventData(newDate)
}, { immediate: true })

// Load data on component mount
onMounted(() => {
  loadEventData(viewedDate.value)
})

// Toggle edit mode
function toggleEditMode() {
  isEditMode.value = !isEditMode.value
}

// Save data to JSON file
async function saveEventData(data) {
  const key = currentDateKey.value
  
  // Update the event data
  selectedEvents.value = data
  
  // In a real application, you would send this to a backend API
  // For now, we'll just update the local data
  console.log('Saving data for', key, data)
  
  // Exit edit mode
  isEditMode.value = false
  
  // TODO: Implement actual save to file via backend API
  alert(`✅ 数据已更新 ${key}！（实际应用中需要后端 API 支持保存到 JSON 文件）`)
}
</script>

<template>
  <article class="semester-calendar">
    <section class="calendar-panel" aria-label="二年级第二学期日历">
      <div class="calendar-header">
        <button class="month-btn" type="button" aria-label="上个月" @click="changeMonth(-1)">
          ‹
        </button>
        <h2>{{ monthTitle }}</h2>
        <button class="month-btn" type="button" aria-label="下个月" @click="changeMonth(1)">
          ›
        </button>
      </div>

      <div class="week-row">
        <div v-for="weekDay in weekDays" :key="weekDay">{{ weekDay }}</div>
      </div>

      <div class="calendar-grid">
        <button
          v-for="day in calendarDays"
          :key="day.key"
          class="date-cell"
          :class="{
            empty: !day.date,
            today: day.isToday,
            selected: day.isSelected,
            'has-event': day.hasEvent,
          }"
          type="button"
          :disabled="!day.date"
          @click="selectDate(day)"
        >
          <span>{{ day.day }}</span>
        </button>
      </div>
    </section>

    <section class="day-detail" aria-label="当日相关事件">
      <div class="day-detail-header">
        <div class="header-row">
          <div>
            <p class="eyebrow">当日相关事件</p>
            <h2>{{ selectedTitle }}</h2>
          </div>
          <button class="edit-toggle-btn" @click="toggleEditMode">
            {{ isEditMode ? '👁️ 查看' : '✏️ 编辑' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>

      <template v-else>
        <template v-if="isEditMode">
          <EventEditor
            v-model="selectedEvents"
            @save="saveEventData"
          />
        </template>
        <template v-else>
          <div class="events-container">
          <div class="event-block">
            <h3>今天作业</h3>
            <div class="rich-content">
              <div v-for="(item, index) in selectedEvents.homework" :key="index" class="rich-item">
                <template v-if="item.type === 'text'">
                  <div class="rich-text">
                    <span
                      v-for="(part, partIndex) in item.content"
                      :key="partIndex"
                      :class="{ bold: part.bold }"
                      :style="{ color: part.color || 'inherit' }"
                    >
                      {{ part.text }}
                    </span>
                  </div>
                </template>
                <template v-else-if="item.type === 'html'">
                  <div class="rich-text" v-html="item.content"></div>
                </template>
                <template v-else-if="item.type === 'image'">
                  <img :src="item.src" :alt="item.alt" class="rich-image" />
                </template>
              </div>
            </div>
          </div>

          <div class="event-block">
            <h3>今日新鲜事</h3>
            <div class="rich-content">
              <div v-for="(item, index) in selectedEvents.joy" :key="index" class="rich-item">
                <template v-if="item.type === 'text'">
                  <div class="rich-text">
                    <span
                      v-for="(part, partIndex) in item.content"
                      :key="partIndex"
                      :class="{ bold: part.bold }"
                      :style="{ color: part.color || 'inherit' }"
                    >
                      {{ part.text }}
                    </span>
                  </div>
                </template>
                <template v-else-if="item.type === 'html'">
                  <div class="rich-text" v-html="item.content"></div>
                </template>
                <template v-else-if="item.type === 'image'">
                  <img :src="item.src" :alt="item.alt" class="rich-image" />
                </template>
              </div>
            </div>
          </div>
        </div>
        </template>
      </template>
    </section>
  </article>
</template>

<style scoped>
.semester-calendar {
  display: grid;
  grid-template-columns: 1fr 4fr;
  gap: 2rem;
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.calendar-panel {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.calendar-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
}

.month-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  transition: background 0.2s;
}

.month-btn:hover {
  background: #e9ecef;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #6c757d;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-cell {
  aspect-ratio: 1 / 1;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.2s;
  position: relative;
}

.date-cell:hover:not(.empty):not(.selected) {
  background: #e9ecef;
}

.date-cell.empty {
  background: transparent;
  cursor: default;
}

.date-cell.today {
  background: #0d6efd;
  color: white;
  font-weight: 600;
}

.date-cell.today:hover {
  background: #0b5ed7;
}

.date-cell.selected {
  background: #198754;
  color: white;
  font-weight: 600;
}

.date-cell.selected:hover {
  background: #157347;
}

.date-cell.has-event::after {
  content: '';
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: #dc3545;
  border-radius: 50%;
}

.day-detail {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 900px;
  min-width: 900px;
}

.day-detail-header {
  margin-bottom: 1.5rem;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.edit-toggle-btn {
  padding: 0.5rem 1rem;
  background: #0d6efd;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.edit-toggle-btn:hover {
  background: #0b5ed7;
}

.events-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: #6c757d;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-detail h2 {
  margin: 0 0 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.event-block {
  margin-bottom: 2rem;
  width: 400px;
}

.event-block h3 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: #0d6efd;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.rich-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rich-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rich-text {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.rich-text :deep(br) {
  display: block;
  content: "";
  margin: 0.3em 0;
}

.rich-text :deep(p) {
  margin: 0.5em 0;
  line-height: 1.8;
}

.rich-text .bold {
  font-weight: 700;
}

.rich-image {
  max-width: 100%;
  border-radius: 8px;
  object-fit: cover;
  margin: 0.5rem 0;
}

.rich-item ul {
  margin: 0;
  padding-left: 1.2rem;
}

.rich-item li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  color: #6c757d;
  font-size: 1rem;
}

@media (max-width: 1024px) {
  .semester-calendar {
    grid-template-columns: 1fr 2fr;
    gap: 1.5rem;
  }
  
  .events-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .semester-calendar {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1rem;
  }
  
  .day-detail {
    max-height: none;
  }
  
  .events-container {
    grid-template-columns: 1fr;
  }
}
</style>
