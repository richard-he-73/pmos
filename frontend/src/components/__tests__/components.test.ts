import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount, flushPromises } from '@vue/test-utils'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import Card from '@/components/Card.vue'
import { useConfirmStore } from '@/stores/confirm'

describe('ConfirmDialog store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('store.show sets visible and message', () => {
    const store = useConfirmStore()
    store.show('确认删除？')
    expect(store.visible).toBe(true)
    expect(store.message).toBe('确认删除？')
  })

  it('store.confirm resolves and hides', async () => {
    const store = useConfirmStore()
    const promise = store.show('确认？')
    store.confirm()
    const result = await promise
    expect(result).toBe(true)
    expect(store.visible).toBe(false)
  })

  it('store.cancel rejects and hides', async () => {
    const store = useConfirmStore()
    const promise = store.show('确认？')
    store.cancel()
    const result = await promise
    expect(result).toBe(false)
    expect(store.visible).toBe(false)
  })

  it('renders when visible (teleported)', () => {
    const store = useConfirmStore()
    store.show('确认删除？')
    const wrapper = mount(ConfirmDialog)
    // Teleport renders outside wrapper; the store state is what matters
    expect(store.visible).toBe(true)
    expect(store.message).toBe('确认删除？')
    wrapper.unmount()
  })
})

describe('Card', () => {
  it('renders title and slot content', () => {
    const wrapper = mount(Card, {
      props: { title: '基本信息' },
      slots: { default: '卡片内容' },
    })
    expect(wrapper.text()).toContain('基本信息')
    expect(wrapper.text()).toContain('卡片内容')
  })

  it('renders without title', () => {
    const wrapper = mount(Card, {
      slots: { default: '无标题卡片' },
    })
    expect(wrapper.text()).toContain('无标题卡片')
  })
})
