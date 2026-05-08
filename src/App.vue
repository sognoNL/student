<script setup>
import { computed, ref } from 'vue'
import ClockA4Generator from './components/ClockA4Generator.vue'
import OralArithmeticGenerator from './components/OralArithmeticGenerator.vue'
import SemesterDailyCalendar from './components/SemesterDailyCalendar.vue'

const subjects = [
  { name: '二年级下', children: ['教学日历', '今日事'] },
  { name: '语文', children: ['二下注音', '二下看拼音写词语'] },
  { name: '数学', children: ['时间练习', '口算'] },
  // { name: '英语', children: ['1 占位标题', '2 占位标题', '3 占位标题'] },
  // { name: '科学', children: ['1 占位标题', '2 占位标题', '3 占位标题'] },
  // { name: '体育', children: ['1 占位标题', '2 占位标题', '3 占位标题'] },
  // { name: '其他', children: ['1 占位标题', '2 占位标题', '3 占位标题'] },
]

const pdfResources = {
  '语文-二下注音': {
    title: '第1-8单元识字表注音练习',
    src: '/pdfs/chinese-phonetic-practice-units-1-8.pdf',
  },
  '语文-二下看拼音写词语': {
    title: '第1-8单元看拼音写词语',
    src: '/pdfs/chinese-pinyin-words-units-1-8.pdf',
  },
}

const imageResources = {
  '二年级第二学期-教学日历': {
    eyebrow: '二年级第二学期',
    title: '教学日历',
    src: '/images/teaching-calendar.png',
  },
}
const DEFAULT_TAB = {
  subject: '二年级第二学期',
  item: '今日事',
}

const selected = ref(DEFAULT_TAB)
// const selected = ref(null)
const visibleSubjectName = ref('')

const selectedKey = computed(() =>
  selected.value ? `${selected.value.subject}-${selected.value.item}` : '',
)

const selectedPdf = computed(() => pdfResources[selectedKey.value])
const selectedImage = computed(() => imageResources[selectedKey.value])
function selectItem(subject, item) {
  selected.value = { subject, item }
  visibleSubjectName.value = ''
}

function openSubject(subject) {
  visibleSubjectName.value = subject
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header" @mouseleave="visibleSubjectName = ''">
      <div class="top-bar">
        <h1>202班资料中心</h1>
        <nav class="primary-nav" aria-label="一级目录">
          <div
            v-for="subject in subjects"
            :key="subject.name"
            @mouseenter="visibleSubjectName = subject.name"
            class="primary-nav-item"
          >
            <button
              class="primary-nav-link"
              type="button"
              :class="{
                active:
                  visibleSubjectName === subject.name ||
                  selected?.subject === subject.name,
              }"
              @focus="visibleSubjectName = subject.name"
              @click="openSubject(subject.name)"
            >
              {{ subject.name }}
            </button>

            <div
              v-if="visibleSubjectName === subject.name"
              class="secondary-nav-area"
            >
              <div class="secondary-nav-card">
                <div class="secondary-nav-list" aria-label="二级目录">
                  <button
                    v-for="item in subject.children"
                    :key="`${subject.name}-${item}`"
                    class="secondary-nav-link"
                    type="button"
                    :class="{ active: selectedKey === `${subject.name}-${item}` }"
                    @click="selectItem(subject.name, item)"
                  >
                    {{ item }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <main class="workspace">
      <section class="content-panel">
        <ClockA4Generator v-if="selectedKey === '数学-时间练习'" />
        <OralArithmeticGenerator v-else-if="selectedKey === '数学-口算'" />
        <SemesterDailyCalendar v-else-if="selectedKey === '二年级第二学期-今日事'" />
        <article v-else-if="selectedImage" class="image-viewer">
          <div class="image-toolbar">
            <div>
              <p class="eyebrow">{{ selectedImage.eyebrow }}</p>
              <h2>{{ selectedImage.title }}</h2>
            </div>
            <a :href="selectedImage.src" target="_blank" rel="noreferrer">新窗口打开</a>
          </div>
          <div class="image-frame">
            <img :src="selectedImage.src" :alt="selectedImage.title" />
          </div>
        </article>
        <article v-else-if="selectedPdf" class="pdf-viewer">
          <div class="pdf-toolbar">
            <div>
              <p class="eyebrow">语文资料</p>
              <h2>{{ selectedPdf.title }}</h2>
            </div>
            <a :href="selectedPdf.src" target="_blank" rel="noreferrer">新窗口打开</a>
          </div>
          <iframe
            class="pdf-frame"
            :src="selectedPdf.src"
            :title="`${selectedPdf.title} PDF`"
          ></iframe>
        </article>

        <div v-else class="content-header">
          <p class="eyebrow">资料概览</p>
          <h2>
            {{ selected ? `${selected.subject} - ${selected.item}` : '请选择左侧学科资料' }}
          </h2>
        </div>
      </section>
    </main>
  </div>
</template>
