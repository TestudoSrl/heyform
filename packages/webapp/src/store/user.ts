import { create } from 'zustand'

import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { USER_STORAGE_KEY } from '@/consts'
import { UserType } from '@/types'

interface UserStoreType {
  user: UserType
  temporaryEmail?: string
  verifyEmailSentAt?: number

  setUser: (user: UserType) => void
  updateUser: (user: Partial<UserType>) => void
  setTemporaryEmail: (email?: string) => void
  setVerifyEmailSentAt: (value?: number) => void
}

export const useUserStore = create<UserStoreType>()(
  persist(
    immer(set => ({
      user: {} as UserType,

      setUser: user => {
        set(state => {
          state.user = user
        })
      },

      updateUser: user => {
        set(state => {
          state.user = { ...state.user, ...user }
        })
      },

      setTemporaryEmail: email => {
        set(state => {
          state.temporaryEmail = email
        })
      },

      setVerifyEmailSentAt: value => {
        set(state => {
          state.verifyEmailSentAt = value
        })
      }
    })),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) =>
            ['temporaryEmail', 'user', 'verifyEmailSentAt'].includes(key)
          )
        )
    }
  )
)
