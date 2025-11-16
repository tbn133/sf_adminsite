<template>
  <q-btn-dropdown flat round dense icon="language" class="toolbar-btn" size="md">
    <q-tooltip>{{ $t('common.language') }}</q-tooltip>

    <q-list>
      <q-item
        v-for="lang in languages"
        :key="lang.value"
        clickable
        v-close-popup
        :active="currentLocale === lang.value"
        active-class="text-primary"
        @click="changeLanguage(lang.value)"
      >
        <q-item-section avatar>
          <q-icon :name="lang.icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ lang.label }}</q-item-label>
        </q-item-section>
        <q-item-section side v-if="currentLocale === lang.value">
          <q-icon name="check" color="primary" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

const { locale } = useI18n()
const $q = useQuasar()

const languages = [
  { value: 'vi', label: 'Tiếng Việt', icon: 'flag' },
  { value: 'en', label: 'English', icon: 'flag' },
]

const currentLocale = computed(() => locale.value)

function changeLanguage(lang) {
  locale.value = lang
  localStorage.setItem('locale', lang)

  $q.notify({
    type: 'positive',
    message: lang === 'vi' ? 'Đã chuyển sang Tiếng Việt' : 'Switched to English',
    position: 'top',
    timeout: 1500,
  })
}
</script>
