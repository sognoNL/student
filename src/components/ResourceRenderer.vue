<template>
  <component :is="resolvedComponent" v-bind="propsData" />
</template>

<script setup>
import { computed } from 'vue'

// 业务组件
import PdfImageViewer from './PdfImageViewer.vue'
import ScheduleViewer from './ScheduleViewer.vue'
import ClockA4Generator from './ClockA4Generator.vue'
import OralArithmeticGenerator from './OralArithmeticGenerator.vue'
import SemesterDailyCalendar from './SemesterDailyCalendar.vue'

const props = defineProps({
  resource: Object,
})

// 1️⃣ 自动选择组件
const resolvedComponent = computed(() => {
  const r = props.resource

  if (!r) return 'div'

  switch (r.type) {
    case 'pdf':
      return PdfImageViewer

    case 'image':
      return 'ImageViewer'

    case 'calendar':
      return SemesterDailyCalendar

    case 'schedule':
      return ScheduleViewer

    case 'clock':
      return ClockA4Generator

    case 'oral':
      return OralArithmeticGenerator

    default:
      return 'div'
  }
})

// 2️⃣ 自动组装 props
const propsData = computed(() => {
  const r = props.resource
  if (!r) return {}

  switch (r.type) {
    case 'pdf':
      return {
        pdf: {
          title: r.title,
          images: r.images || [],
        },
        subtitle: '资料',
      }

    case 'image':
      return {
        src: r.src,
        title: r.title,
      }

    case 'schedule':
      return {
        winter: r.winter,
        summer: r.summer,
      }

    default:
      return {}
  }
})
</script>