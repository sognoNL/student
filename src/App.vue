<script setup>
import { computed, ref } from 'vue'
import ClockA4Generator from './components/ClockA4Generator.vue'
import OralArithmeticGenerator from './components/OralArithmeticGenerator.vue'
import VerticalArithmeticGenerator from './components/VerticalArithmeticGenerator.vue'
import SemesterDailyCalendar from './components/SemesterDailyCalendar.vue'
import ScheduleViewer from './components/ScheduleViewer.vue'

// ✅ 一级菜单优化（前三个无 children）
const allSubjects = [
  { name: '教学日历', icon: '📅', children: [] },
  { name: '作息时间表', icon: '🕐', children: [] },
  { name: '今日事', icon: '📋', children: [] },
  { name: '语文', icon: '📝', children: ['二下注音', '二下看拼音写词语'] },
  { name: '数学', icon: '🔢', children: ['时间练习', '口算', { name: '多位数竖式', restricted: true }] },
]

// ✅ 特定菜单项（需要登录验证）
const RESTRICTED_ITEMS = ['多位数竖式']

// ✅ 登录验证
const isAuthenticated = ref(localStorage.getItem('auth_verified') === '1')
const loginPassword = ref('')
const loginError = ref(false)

function handleLogin() {
  if (loginPassword.value === '111') {
    isAuthenticated.value = true
    localStorage.setItem('auth_verified', '1')
    loginPassword.value = ''
    loginError.value = false
  } else {
    loginError.value = true
  }
}

function handleLogout() {
  isAuthenticated.value = false
  localStorage.removeItem('auth_verified')
  // If currently viewing a restricted item, go back to overview
  if (selected.value) {
    const key = `${selected.value.subject}-${selected.value.item}`
    if (RESTRICTED_ITEMS.includes(selected.value.item)) {
      showDefaultOverview()
    }
  }
}

// ✅ 根据登录状态过滤菜单
const subjects = computed(() => {
  return allSubjects.map(subject => {
    if (!subject.children || subject.children.length === 0) {
      return subject
    }
    const filteredChildren = subject.children.filter(child => {
      const childName = typeof child === 'string' ? child : child.name
      if (!isAuthenticated.value && RESTRICTED_ITEMS.includes(childName)) {
        return false
      }
      return true
    }).map(child => typeof child === 'string' ? child : child.name)
    return { ...subject, children: filteredChildren }
  })
})

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
  '教学日历-教学日历': {
    eyebrow: '二年级第二学期',
    title: '教学日历',
    src: '/images/teaching-calendar.png',
  },
}

const scheduleImages = {
  winter: '/images/winter-schedule.jpg',
  summer: '/images/summer-schedule.jpg',
}

// ✅ 默认选中
const DEFAULT_TAB = {
  subject: '教学日历',
  item: '教学日历',
}

const selected = ref(null)
const visibleSubjectName = ref('')
const showOverview = ref(true)

// ✅ key 统一
const selectedKey = computed(() =>
  selected.value ? `${selected.value.subject}-${selected.value.item}` : '',
)

const selectedPdf = computed(() => pdfResources[selectedKey.value])
const selectedImage = computed(() => imageResources[selectedKey.value])

// ✅ 修复：作息时间表判断
const showScheduleTab = computed(() =>
  selected.value?.subject === '作息时间表',
)

// ✅ 点击二级
function selectItem(subject, item) {
  selected.value = { subject, item }
  visibleSubjectName.value = ''
  showOverview.value = false
}

// ✅ hover 展开（仅有 children 才触发）
function openSubject(subject) {
  const target = subjects.value.find(s => s.name === subject)
  if (target.children && target.children.length > 0) {
    visibleSubjectName.value = subject
  }
}

// ✅ 一级点击（核心优化）
function selectTopLevelItem(subjectName) {
  const subject = subjects.value.find(s => s.name === subjectName)

  if (!subject.children || subject.children.length === 0) {
    // ✅ 无子菜单 → 直接选中
    selected.value = {
      subject: subjectName,
      item: subjectName,
    }
    visibleSubjectName.value = ''
    showOverview.value = false
  } else {
    // ✅ 有子菜单 → 展开
    openSubject(subjectName)
    showOverview.value = false
  }
}

function showDefaultOverview() {
  showOverview.value = true
  selected.value = null
  visibleSubjectName.value = ''
}
</script>

<template>
  <div class="page-shell">
    <aside class="sidebar">
      <h1 class="site-title" @click="showDefaultOverview()">202班资料中心</h1>

      <!-- 登录区域 -->
      <div class="auth-section">
        <div v-if="!isAuthenticated" class="auth-login">
          <input
            v-model="loginPassword"
            type="password"
            class="auth-input"
            placeholder="验证码"
            @keyup.enter="handleLogin"
          />
          <button class="auth-btn" @click="handleLogin">验证</button>
        </div>
        <div v-else class="auth-verified">
          <span class="auth-badge">已验证</span>
          <button class="auth-logout-btn" @click="handleLogout">退出</button>
        </div>
        <p v-if="loginError" class="auth-error">验证码错误</p>
      </div>

      <nav class="sidebar-nav">
        <div
          v-for="subject in subjects"
          :key="subject.name"
          class="nav-group"
        >
          <button
            class="nav-group-title"
            :class="{ active: selected?.subject === subject.name || visibleSubjectName === subject.name }"
            @click="selectTopLevelItem(subject.name)"
            @mouseenter="openSubject(subject.name)"
          >
            <span class="nav-icon">{{ subject.icon }}</span>
            {{ subject.name }}
          </button>
          <div v-if="subject.children && subject.children.length > 0" class="nav-children">
            <button
              v-for="item in subject.children"
              :key="`${subject.name}-${item}`"
              class="nav-child-link"
              :class="{ active: selectedKey === `${subject.name}-${item}` }"
              @click="selectItem(subject.name, item)"
            >
              {{ item }}
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <main class="workspace">
      <section class="content-panel">
        <!-- ✅ 近日要事 -->
        <article v-if="showOverview" class="overview-viewer">
          <div class="overview-header">
            <h2>近日要事</h2>
          </div>
          <div class="overview-container">
            <div class="overview-item">
              <div class="overview-image-frame">
                <img src="/images/study1.jpg" alt="学习资料1" />
              </div>
            </div>
            <div class="overview-item">
              <div class="overview-image-frame">
                <img src="/images/study2.jpg" alt="学习资料2" />
              </div>
            </div>
          </div>
        </article>

        <!-- ✅ 作息时间表 -->
        <ScheduleViewer
          v-if="showScheduleTab"
          :winter="scheduleImages.winter"
          :summer="scheduleImages.summer"
        />

        <!-- 其他功能 -->
        <ClockA4Generator v-else-if="selectedKey === '数学-时间练习'" />
        <OralArithmeticGenerator v-else-if="selectedKey === '数学-口算'" />
        <VerticalArithmeticGenerator v-else-if="selectedKey === '数学-多位数竖式' && isAuthenticated" />
        <SemesterDailyCalendar v-else-if="selectedKey === '今日事-今日事'" />

        <!-- 图片 -->
        <article v-else-if="selectedImage" class="image-viewer">
          <div class="image-frame">
            <img :src="selectedImage.src" />
          </div>
        </article>

        <!-- PDF -->
        <article v-else-if="selectedPdf" class="pdf-viewer">
          <div class="pdf-toolbar">
            <div>
              <p class="eyebrow">语文资料</p>
              <h2>{{ selectedPdf.title }}</h2>
            </div>
            <a :href="selectedPdf.src" target="_blank">新窗口打开</a>
          </div>

          <iframe class="pdf-frame" :src="selectedPdf.src"></iframe>
        </article>

        <!-- 默认 -->
        <!-- <div v-else class="content-header">
          <h2>
            {{ selected ? `${selected.subject} - ${selected.item}` : '请选择内容' }}
          </h2>
        </div> -->
      </section>
    </main>
  </div>
</template>