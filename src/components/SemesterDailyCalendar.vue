<script setup>
import { computed, ref } from 'vue'

const today = new Date()
const viewedDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

const eventMap = {
  [formatDateKey(today)]: {
    homework: ['语文：阅读课文 10 分钟', '数学：完成口算练习一页'],
    joy: ['今日份快乐：认真完成一件小事，也很棒。'],
  },
}

const monthTitle = computed(() => {
  const year = viewedDate.value.getFullYear()
  const month = viewedDate.value.getMonth() + 1
  return `${year}年${month}月`
})

const selectedTitle = computed(() => formatDisplayDate(selectedDate.value))
const selectedKey = computed(() => formatDateKey(selectedDate.value))

const selectedEvents = computed(() => {
  return (
    eventMap[selectedKey.value] ?? {
      homework: ['今天作业：待补充'],
      joy: ['今日份快乐：待记录'],
    }
  )
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
      hasEvent: Boolean(eventMap[key]),
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
      <p class="eyebrow">当日相关事件</p>
      <h2>{{ selectedTitle }}</h2>

      <div class="event-block">
        <h3>今天作业</h3>
        <ul>
          <li v-for="item in selectedEvents.homework" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="event-block">
        <h3>今日份快乐</h3>
        <ul>
          <li v-for="item in selectedEvents.joy" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>
  </article>
</template>
