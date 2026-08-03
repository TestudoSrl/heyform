import { AppService, FormService } from '@/services'
import { useParam } from '@/utils'

import { Async, Repeat } from '@/components'
import { useFormStore } from '@/store'

import IntegrationItem from './IntegrationItem'
import IntegrationSettingsModal from './IntegrationSettingsModal'

const Skeleton = (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
    <Repeat count={5}>
      <div className="border-input cursor-default rounded-lg border px-4 py-6 text-sm">
        <div className="flex items-center justify-between">
          <div className="skeleton border-accent-light h-8 w-8 rounded-lg border" />
          <div className="skeleton h-8 w-14 rounded-lg"></div>
        </div>
        <div className="mt-2 py-[0.1875rem]">
          <div className="skeleton h-3.5 w-20 rounded-sm"></div>
        </div>
        <div className="mt-1 py-[0.1875rem]">
          <div className="skeleton h-3.5 w-full rounded-sm"></div>
        </div>
        <div className="mt-0.5 py-[0.1875rem]">
          <div className="skeleton h-3.5 w-2/5 rounded-sm"></div>
        </div>
      </div>
    </Repeat>
  </div>
)

export default function FormIntegrations() {
  const { formId } = useParam()
  const { integratedApps, setApps, setIntegrations } = useFormStore()

  async function fetch() {
    const [apps, integrations] = await Promise.all([
      AppService.apps(),
      FormService.integrations(formId)
    ])

    setApps(apps)
    setIntegrations(integrations)

    return true
  }

  return (
    <>
      <div className="mt-10 space-y-12 px-6">
        <Async fetch={fetch} refreshDeps={[formId]} loader={Skeleton}>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {integratedApps.map(app => (
              <IntegrationItem key={app.id} app={app} />
            ))}
          </ul>
        </Async>
      </div>

      <IntegrationSettingsModal />
    </>
  )
}
