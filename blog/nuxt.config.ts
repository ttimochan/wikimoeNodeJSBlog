// https://nuxt.com/docs/api/configuration/nuxt-config

const modulesPlus = []
const publicRuntimeConfigPlus: any = {}
// SHOW_LOADING
publicRuntimeConfigPlus.showLoading = process.env.SHOW_LOADING === '1'
if (process.env.GOOGLE_ADSENSE_ID) {
  modulesPlus.push('@nuxtjs/google-adsense')
  publicRuntimeConfigPlus.googleAdsense = {
    onPageLoad: true,
    pageLevelAds: false,
    id: process.env.GOOGLE_ADSENSE_ID,
    test: process.env.GOOGLE_ADSENSE_TEST_MODE === '1',
  }
  // GOOGLE_ADSENSE_POST_DETAIL_BT
  publicRuntimeConfigPlus.GOOGLE_ADSENSE_POST_DETAIL_BT =
    process.env.GOOGLE_ADSENSE_POST_DETAIL_BT || null
}
// 缓存时间
const cacheTime = process.env.SWR_CACHE_MAXAGE
  ? Number(process.env.SWR_CACHE_MAXAGE)
  : 10
const staleMaxAge = process.env.SWR_CACHE_STALEMAXAGE
  ? Number(process.env.SWR_CACHE_STALEMAXAGE)
  : 3600

let routeRules = {
  '/rss': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/rss`,
  },
  '/rss/blog': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/rss/blog`,
  },
  '/rss/tweet': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/rss/tweet`,
  },
  '/content/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/content/**`,
  },
  '/upload/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/upload/**`,
  },
  '/up_works/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/up_works/**`,
  },
  '/web_demo/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/web_demo/**`,
  },
  // ucloudImg
  '/ucloudImg/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/ucloudImg/**`,
  },
  '/api/blog/**': {
    proxy: `${process.env.NUXT_API_API_DOMAIN}/api/blog/**`,
  },
}
// 如果开启了SWR
if (process.env.SWR_ENABLED === '1') {
  const swrRules = {
    '/': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge,
      },
    },
    '/page/**': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge,
      },
    },
    '/post/**': {
      swr: cacheTime,
      cache: {
        staleMaxAge: staleMaxAge,
      },
    },
  }
  routeRules = { ...routeRules, ...swrRules }
}
const CACHE_MAX_PAGE = process.env.CACHE_MAX_PAGE
  ? Number(process.env.CACHE_MAX_PAGE)
  : 10
const CACHE_TTL = process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : 60000
console.log('缓存最大页面数量', CACHE_MAX_PAGE)
console.log('缓存时间', CACHE_TTL)
console.log('routeRules', routeRules)
export default defineNuxtConfig({
  app: {
    head: {
      charset: 'utf-8',
      viewport:
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0',
    },
  },
  devtools: { enabled: true },
  devServer: {
    port: 8078,
  },
  modules: ['@pinia/nuxt', '@nuxt/ui', 'nuxt-swiper', ...modulesPlus],

  swiper: {
    // Swiper options
    //----------------------
    // prefix: 'Swiper',
    styleLang: 'css',
    // modules: ['navigation', 'pagination'], // all modules are imported by default
  },
  css: ['~/assets/css/common.css', 'photoswipe/style.css'],
  runtimeConfig: {
    apiDomain: '',
    public: {
      ...publicRuntimeConfigPlus,
    },
  },
  routeRules,
  colorMode: {
    preference: 'light',
  },
  nitro: {
    output: {
      dir: 'build/.output',
      serverDir: 'build/.output/server',
      publicDir: 'build/.output/public',
    },
    storage: {
      cache: {
        driver: 'lruCache',
        max: CACHE_MAX_PAGE,
        ttl: CACHE_TTL,
        updateAgeOnGet: true,
        updateAgeOnHas: true,
      },
    },
    devStorage: {
      cache: {
        driver: 'lruCache',
        max: CACHE_MAX_PAGE,
        ttl: CACHE_TTL,
        updateAgeOnGet: true,
        updateAgeOnHas: true,
      },
    },
  },
  vite: {
    esbuild: {
      drop: ['debugger'],
      pure: [
        'console.log',
        'console.error',
        'console.warn',
        'console.debug',
        'console.trace',
      ],
    },
  },
})
