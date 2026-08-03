import { useTranslation } from 'react-i18next'

import { Form, Switch } from '@/components'

export default function FormSettingsEmailNotification() {
  const { t } = useTranslation()

  return (
    <section id="emailNotification" className="pt-10">
      <h2 className="hf-section-title">{t('form.settings.emailNotification.title')}</h2>

      <div className="mt-4 space-y-8">
        <Form.Item
          className="[&_[data-slot=content]]:pt-1.5"
          name="enableEmailNotification"
          label={t('form.settings.emailNotification.self.headline')}
          description={t('form.settings.emailNotification.self.subHeadline')}
          isInline
        >
          <Switch />
        </Form.Item>
      </div>
    </section>
  )
}
