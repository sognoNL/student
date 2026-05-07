<script setup>
import { computed, ref } from 'vue'
import ClockA4Generator from './components/ClockA4Generator.vue'
import OralArithmeticGenerator from './components/OralArithmeticGenerator.vue'

const subjects = [
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

const selected = ref(null)

const selectedKey = computed(() =>
  selected.value ? `${selected.value.subject}-${selected.value.item}` : '',
)

const selectedPdf = computed(() => pdfResources[selectedKey.value])

function selectItem(subject, item) {
  selected.value = { subject, item }
}
</script>

<template>
  <div class="page-shell">
    <header class="top-bar">
      <h1>各学科资料集成</h1>
    </header>

    <main class="workspace">
      <aside class="sidebar" aria-label="学科导航">
        <nav class="subject-nav">
          <section v-for="subject in subjects" :key="subject.name" class="subject-group">
            <h2>{{ subject.name }}</h2>
            <ul>
              <li v-for="item in subject.children" :key="`${subject.name}-${item}`">
                <button
                  class="nav-link"
                  type="button"
                  :class="{ active: selectedKey === `${subject.name}-${item}` }"
                  @click="selectItem(subject.name, item)"
                >
                  {{ item }}
                </button>
              </li>
            </ul>
          </section>
        </nav>
      </aside>

      <section class="content-panel">
        <ClockA4Generator v-if="selectedKey === '数学-时间练习'" />
        <OralArithmeticGenerator v-else-if="selectedKey === '数学-口算'" />
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
