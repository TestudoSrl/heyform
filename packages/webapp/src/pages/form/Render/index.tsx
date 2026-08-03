import { FormModel } from '@heyform-inc/shared-types-enums'
import { IconUsersGroup } from '@tabler/icons-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CollaborativeSession, EndpointService } from './service/endpoint'
import { getPreferredLanguage } from './utils/brower-language'
import { FormService } from '@/services'
import { useParam, useQuery } from '@/utils'

import { Async } from '@/components'
import '@/styles/render.scss'

import { Renderer } from './components/Renderer'

const LANGUAGES = ['en', 'de', 'fr', 'pl', 'pt-br', 'ja', 'zh-cn', 'zh-tw']

export default function FormRender() {
  const { t } = useTranslation()
  const { formId, collaborationToken } = useParam()
  const query = useQuery()

  const [form, setForm] = useState<FormModel | null>(null)
  const [locale, setLocale] = useState<string>()
  const [collaboration, setCollaboration] = useState<CollaborativeSession>()
  const handleCollaborationChange = useCallback((session: CollaborativeSession) => {
    setCollaboration(current => {
      if (!current || session.completed || session.revision >= current.revision) {
        return session
      }

      return current
    })
  }, [])

  async function fetchData() {
    const [result, sharedSession] = await Promise.all([
      FormService.publicForm(formId),
      collaborationToken
        ? EndpointService.collaborativeSession(collaborationToken)
        : Promise.resolve(undefined)
    ])

    if (sharedSession && sharedSession.formId !== formId) {
      throw new Error('This shared response belongs to a different form')
    }

    setForm(result)
    setCollaboration(sharedSession)
    setLocale(getPreferredLanguage(LANGUAGES, result.form.settings.locale || LANGUAGES[0]))

    return true
  }

  return (
    <Async fetch={fetchData}>
      {form && (
        <div id="heyform-render-root">
          {collaboration && (
            <div className="bg-brand text-primary-light pointer-events-none fixed right-3 top-3 z-[100] flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg sm:right-5 sm:top-5 sm:text-sm">
              <IconUsersGroup className="h-4 w-4" aria-hidden="true" />
              <span>{t('form.share.collaborative.headline')}</span>
              <span aria-hidden="true">·</span>
              <span>
                {t('form.share.collaborative.participants', {
                  count: collaboration.participantCount
                })}
              </span>
            </div>
          )}

          <Renderer
            form={form}
            query={query}
            locale={locale!}
            collaboration={collaboration}
            onCollaborationChange={handleCollaborationChange}
          />
        </div>
      )}
    </Async>
  )
}
