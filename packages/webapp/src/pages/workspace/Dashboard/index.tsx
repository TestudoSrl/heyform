import { useTranslation } from 'react-i18next'

import { getTimePeriod } from '@/utils'

import IconWavingHand from '@/assets/waving-hand.webp'
import { useUserStore } from '@/store'

import Overview from './Overview'
import RecentForms from './RecentForms'

export default function WorkspaceDashboard() {
  const { t } = useTranslation()

  const { user } = useUserStore()

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="hf-page-title ml-6 flex items-center gap-2">
          <img className="-mt-2 h-9 w-9 sm:h-8 sm:w-8" src={IconWavingHand} />
          {t(`dashboard.${getTimePeriod()}`, { name: user.name })}
        </h1>

        {/* Overview */}
        <section className="mt-8">
          <div className="flex items-end justify-between">
            <h2 className="hf-section-title ml-6">{t('dashboard.overview')}</h2>
          </div>
          <Overview />
        </section>

        {/* Recent forms */}
        <section className="mt-12">
          <h2 className="hf-section-title ml-6">{t('dashboard.recentForms')}</h2>
          <RecentForms />
        </section>
      </div>
    </div>
  )
}
