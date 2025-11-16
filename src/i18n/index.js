import { createI18n } from 'vue-i18n'
import vi from './locales/vi'
import en from './locales/en'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: localStorage.getItem('locale') || 'vi', // Default locale
  fallbackLocale: 'en',
  messages: {
    vi,
    en,
  },
  globalInjection: true, // Inject $t globally
})

export default i18n
