import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    user: null
  }),
  actions: {
    setUser(user: any) {
      this.user = user
    }
  }
})
