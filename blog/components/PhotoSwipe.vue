<template>
  <ClientOnly>
    <Teleport :to="`#caption-${componentId}`" v-if="showUI && description">
      <div
        class="photo-swipe-photo-swipe-caption bg-primary bg-opacity-80 rounded px-2 py-1 text-white text-sm whitespace-pre-line"
      >
        {{ description }}
      </div>
    </Teleport>
    <Teleport
      :to="`#photo-swipe-${componentId}`"
      v-if="showUI && attachmentList.length > 1"
    >
      <UPopover :popper="{ arrow: true, offsetDistance: 0 }">
        <div class="photo-swipe-photo-swipe-btn">
          <UIcon name="i-heroicons-photo-solid" />
        </div>
        <template #panel="{ close }">
          <div class="p-4">
            <!-- 关闭按钮 -->
            <div class="flex justify-end mb-2">
              <UButton
                size="2xs"
                type="primary"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                @click="close"
              />
            </div>
            <div class="grid grid-cols-3 grid-rows-3 gap-4">
              <div
                class="w-24 h-24"
                v-for="(item, index) in currentGroup"
                :key="item._id"
              >
                <div
                  class="w-full h-full bg-cover bg-center bg-no-repeat rounded bg-primary-200"
                  :class="{
                    'border-2 border-solid border-primary-500':
                      currentAttachmentId === item._id,
                    'border-2 border-solid border-primary-100':
                      currentAttachmentId !== item._id,
                  }"
                  :style="{
                    backgroundImage: `url(${item.thumfor || item.filepath})`,
                  }"
                  @click="goTo(index + groupPage * 9, close)"
                >
                  <!-- 如果类型是视频加上播放按钮 -->
                  <div
                    v-if="item.mimetype.indexOf('video') > -1"
                    class="w-full h-full flex items-center justify-center"
                  >
                    <div class="text-white text-4xl opacity-80">
                      <UIcon name="i-heroicons-play-solid" size="2xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 分页器 -->
            <div class="flex justify-center mt-4">
              <div class="flex items-center">
                <UButton
                  :disabled="!hasPrevGroup"
                  @click="prevGroup"
                  size="2xs"
                  type="primary"
                  icon="i-heroicons-chevron-left"
                />
                <div class="mx-2 px-1">
                  {{ groupPage + 1 }}/{{ groupCount }}
                </div>
                <UButton
                  :disabled="!hasNextGroup"
                  @click="nextGroup"
                  size="2xs"
                  type="primary"
                  icon="i-heroicons-chevron-right"
                />
              </div>
            </div>
          </div>
        </template>
      </UPopover>
    </Teleport>
  </ClientOnly>
  <DivLoading class="photo-swipe-load-body" :loading="loading" />
</template>
<script setup>
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { useOptionStore } from '@/store/options'

const optionStore = useOptionStore()
const { options } = storeToRefs(optionStore)

const emits = defineEmits()

const toast = useToast()
const showUI = ref(false)

const componentId = generateRandomString(8)

const attachmentList = ref([])
const loading = ref(false)
let loadingTimer = null
const loadImageDimensions = async (list) => {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loadingTimer = setTimeout(() => {
    loading.value = true
  }, 500)
  for (let item of list) {
    if (!item._id) {
      item._id = generateRandomString(8)
    }
    const mimetype = item.mimetype || ''
    let width = item.width
    let height = item.height
    if (item.src) {
      item.filepath = item.src
    }
    const src = item.filepath
    item.mimetype = mimetype

    // 如果width或者height不存在需要重新计算
    if (!width || !height) {
      // 如果是视频，默认宽高，1280x720
      if (mimetype.indexOf('video') > -1) {
        width = 1280
        height = 720
      } else {
        // 如果是图片，需要计算宽高
        const img = new Image()
        img.src = src
        try {
          await new Promise((resolve, reject) => {
            img.onload = function () {
              item.width = img.width
              item.height = img.height
              resolve()
            }
            img.onerror = function () {
              reject('图片加载失败')
            }
          })
        } catch (error) {
          console.error(error)
          item.width = 0
          item.height = 0
        }
      }
    }
  }
  if (loadingTimer) {
    clearTimeout(loadingTimer)
    loadingTimer = null
  }
  loading.value = false
  attachmentList.value = list
}
let closeCallback = null
const open = async (list = [], showIndex = 0, closeCallback_) => {
  closeCallback = closeCallback_ || null
  await loadImageDimensions(list)
  itemIndex.value = showIndex
  firstFlag = true
  if (attachmentList.value.length <= 0) {
    toast.add({
      title: '暂无相关内容',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    })
    return
  }
  lightbox.addFilter('numItems', (numItems) => {
    return attachmentList.value.length
  })
  lightbox.addFilter('itemData', (itemData, index) => {
    const mimetype = attachmentList.value[index].mimetype
    let width = attachmentList.value[index].width
    let height = attachmentList.value[index].height
    let src = attachmentList.value[index].filepath
    // thumfor 在这里不需要，上面的相册需要

    // 通过正则判断是否携带协议和域名
    if (!/^https?:\/\//.test(src)) {
      src = options.value.siteUrl + src
    }
    // 如果width或者height不存在需要重新计算
    if (!width || !height) {
      // 如果是视频，默认宽高，1280x720
      if (mimetype.indexOf('video') > -1) {
        width = 1280
        height = 720
      }
    }

    if (mimetype.indexOf('video') > -1) {
      return {
        html: `<div class="previewer-video-body">
                  <video
                    id="lightbox-video-${index}"
                    controls="controls"
                    playsinline="true"
                    preload="auto"
                    muted="muted"
                    autoplay="autoplay"
                    loop="loop"
                    width="${width}"
                    height="${height}">
                    <source
                      src="${src}"
                      type="video/mp4"
                    />
                    </video>
                  </div>`,
      }
    }
    return {
      src: src,
      width: attachmentList.value[index].width,
      height: attachmentList.value[index].height,
    }
  })
  lightbox.loadAndOpen(showIndex)
  if (window.location.hash !== '#photo-swipelightboxopen') {
    window.history.pushState(null, '', '#photo-swipelightboxopen')
  }
}

setPhotoSwipe(open)

const itemIndex = ref(0)
const description = computed(() => {
  return attachmentList.value[itemIndex.value]?.description
})

let lightbox = null
let videoTimer = null
let firstFlag = true
const initLightbox = async () => {
  const lightboxopen = window.location.hash === '#photo-swipelightboxopen'
  if (lightboxopen) {
    window.location.hash = ''
  }
  lightbox = new PhotoSwipeLightbox({
    pswpModule: () => import('photoswipe'),
    preload: [1, 2],
    mainClass: 'photo-swipe-photo-swipe',
    padding: { top: 40, bottom: 60, left: 0, right: 0 },
  })
  lightbox.init()
  lightbox.on('close', () => {
    console.log('close')
    if (closeCallback) {
      closeCallback()
      closeCallback = null
    }
    if (videoTimer) {
      console.log('clearTimeout')
      clearTimeout(videoTimer)
      videoTimer = null
    }
    if (window.location.hash === '#photo-swipelightboxopen') {
      window.history.back()
    }
    showUI.value = false
    attachmentList.value = []
  })
  lightbox.on('change', () => {
    console.log('change')
    const currIndex = lightbox.pswp.currIndex
    itemIndex.value = currIndex
    // 计算当前Index对应的groupPage页数
    groupPage.value = Math.floor(currIndex / 9)

    if (videoTimer) {
      clearTimeout(videoTimer)
      videoTimer = null
    }
    videoTimer = setTimeout(
      () => {
        const videoList = document.querySelectorAll(
          '.previewer-video-body video'
        )
        videoList.forEach((video) => {
          video.pause()
        })
        // 当前video播放
        const video = document.querySelector(`#lightbox-video-${currIndex}`)
        video && video.play()
        videoTimer = null
      },
      firstFlag ? 800 : 100
    )
    firstFlag = false
  })
  lightbox.on('initialLayout', () => {
    console.log('initialLayout')
    // photoswipe measures size of various elements
    // if you need to read getBoundingClientRect of something - do it here
    showUI.value = true
  })
  // 注册UI
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'custom-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: `<div id="caption-${componentId}"></div>`,
      onInit: (el, pswp) => {
        console.log(el)
      },
    })
  })
  lightbox.on('uiRegister', function () {
    lightbox.pswp.ui.registerElement({
      name: 'photo-swipe-button',
      order: 9,
      isButton: true,
      html: `<div id="photo-swipe-${componentId}"></div>`,
    })
  })
}
const onHashchange = () => {
  if (window.location.hash !== '#photo-swipelightboxopen') {
    console.log('close hashchange')
    lightbox && lightbox.pswp && lightbox.pswp.close()
  }
}

// 将附件按照9个一组分组
const attachmentGroup = computed(() => {
  const group = []
  const len = attachmentList.value.length
  for (let i = 0; i < len; i += 9) {
    group.push(attachmentList.value.slice(i, i + 9))
  }
  return group
})
// 一共有多少组
const groupCount = computed(() => {
  return attachmentGroup.value.length
})
// 分组的页
const groupPage = ref(0)
// 当前分组
const currentGroup = computed(() => {
  return attachmentGroup.value[groupPage.value]
})
// 上一页
const prevGroup = () => {
  groupPage.value = groupPage.value - 1
}
// 下一页
const nextGroup = () => {
  groupPage.value = groupPage.value + 1
}
// 是否有上一页
const hasPrevGroup = computed(() => {
  return groupPage.value > 0
})
// 是否有下一页
const hasNextGroup = computed(() => {
  return groupPage.value < groupCount.value - 1
})
// 当前选中的附件ID
const currentAttachmentId = computed(() => {
  return attachmentList.value[itemIndex.value]?._id
})
const goTo = (index, close) => {
  lightbox.pswp.goTo(index)
  close()
}
onMounted(() => {
  initLightbox()
  window.addEventListener('hashchange', onHashchange)
})
onUnmounted(() => {
  lightbox.destroy()
  lightbox = null
  window.removeEventListener('hashchange', onHashchange)
})
</script>
<style scoped>
.photo-swipe-photo-swipe-btn {
  width: 50px;
  height: 60px;
  color: #ffffff;
  font-size: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo-swipe-photo-swipe-caption {
  max-width: 1280px;
}
.photo-swipe-load-body {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
}
</style>
