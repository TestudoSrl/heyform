import {
  ActionEnum,
  FieldKindEnum,
  FormField,
  OTHER_FIELD_KINDS,
  QUESTION_FIELD_KINDS
} from '@heyform-inc/shared-types-enums'
import * as Tooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'
import type { FC } from 'react'
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'

import { flattenFieldsWithGroups, parseFields, progressPercentage } from './utils'
import { applyLogicToFields } from '@heyform-inc/answer-utils'
import { helper, nanoid } from '@heyform-inc/utils'

import { ClosedMessage } from './blocks/ClosedMessage'
import { SuspendedMessage } from './blocks/SuspendedMessage'
import type { IState, IStripe } from './store'
import { StoreContext, StoreReducer, getStorage } from './store'
import { getTheme } from './theme'
import type { IFormModel } from './typings'
import { Blocks } from './views/Blocks'
import { Sidebar } from './views/Sidebar'

export interface FormRendererProps {
  className?: string
  form: IFormModel
  locale: string
  query?: Record<string, any>
  stripeApiKey?: string
  stripeAccountId?: string
  autoSave?: boolean
  customUrlRedirects?: boolean
  reportAbuseURL?: string
  alwaysShowNextButton?: boolean
  enableQuestionList?: boolean
  enableNavigationArrows?: boolean
  sharedValues?: Record<string, any>
  sharedRevision?: number
  sharedSubmitted?: boolean
  ssr?: boolean
  onSubmit?: (values: Record<string, any>, isPartial?: boolean, stripe?: IStripe) => Promise<void>
  onValuesChange?: (changes: Record<string, any>) => void
}

function initStore(
  form: IFormModel,
  locale: string,
  autoSave: boolean,
  allowPayment: boolean,
  initialValues?: Record<string, any>,
  ssr?: boolean
): IState {
  const list = parseFields(form.fields, form.translations?.[locale])

  const welcomeField = list.find(f => f.kind === FieldKindEnum.WELCOME)
  const thankYouFields = list.filter(f => f.kind === FieldKindEnum.THANK_YOU)

  let allFields = flattenFieldsWithGroups(list.filter(f => !OTHER_FIELD_KINDS.includes(f.kind)))

  if (!allowPayment) {
    allFields = allFields.filter(f => f.kind !== FieldKindEnum.PAYMENT)
  }

  const jumpFieldIds = (form.logics || [])
    .filter(l => l.payloads.some(p => p.action.kind === ActionEnum.NAVIGATE))
    .map(l => l.fieldId)

  const values = initialValues || getStorage(form.id, autoSave)
  const { fields, variables } = applyLogicToFields(
    [...allFields, ...thankYouFields].filter(Boolean) as FormField[],
    form.logics,
    form.variables,
    values
  )

  const questionCount = fields.filter(f => QUESTION_FIELD_KINDS.includes(f.kind)).length
  const percentage = progressPercentage(Object.keys(values).length, questionCount)

  return {
    // Preventing hydration mismatch errors
    instanceId: ssr ? '' : nanoid(8),
    welcomeField,
    thankYouFields,
    allFields,
    fields,
    hiddenFields: form.hiddenFields || [],
    translations: form.translations,
    query: {},
    jumpFieldIds,
    logics: form.logics,
    parameters: form.variables,
    variables,
    values,
    percentage,
    questionCount,
    formId: form.id,
    scrollIndex: 0,
    scrollTo: 'next',
    settings: form.settings,
    autoSave,
    changeVersion: 0,
    locale,
    theme: getTheme(form.themeSettings?.theme),
    logo: form.themeSettings?.logo
  }
}

export const FormRenderer: FC<FormRendererProps> = ({
  className,
  form,
  locale,
  query = {},
  autoSave = true,
  stripeApiKey,
  stripeAccountId,
  reportAbuseURL,
  alwaysShowNextButton = false,
  customUrlRedirects = false,
  enableQuestionList,
  enableNavigationArrows,
  sharedValues,
  sharedRevision,
  sharedSubmitted,
  ssr = false,
  onSubmit,
  onValuesChange
}) => {
  const [isAndroid, setAndroid] = useState(false)

  useEffect(() => {
    setAndroid(window.heyform.device.android)
  }, [])

  const allowPayment = useMemo(
    () => !!(stripeApiKey && stripeAccountId),
    [stripeApiKey, stripeAccountId]
  )
  const isQuestionListEnabled = useMemo(
    () =>
      !helper.isNil(enableQuestionList)
        ? !!enableQuestionList
        : !!form.settings?.enableQuestionList,
    [enableQuestionList, form.settings?.enableQuestionList]
  )
  const isNavigationArrowsEnabled = useMemo(
    () =>
      !helper.isNil(enableNavigationArrows)
        ? !!enableNavigationArrows
        : helper.isNil(form.settings?.enableNavigationArrows)
          ? true
          : !!form.settings?.enableNavigationArrows,
    [enableNavigationArrows, form.settings?.enableNavigationArrows]
  )
  const memoState: IState = useMemo(
    () => ({
      reportAbuseURL,
      customUrlRedirects,
      alwaysShowNextButton,
      enableQuestionList: isQuestionListEnabled,
      enableNavigationArrows: isNavigationArrowsEnabled,
      isCollaborative: !!onValuesChange,
      onSubmit,
      ...initStore(form, locale, autoSave, allowPayment, sharedValues, ssr),
      query
    }),
    [
      reportAbuseURL,
      customUrlRedirects,
      alwaysShowNextButton,
      isQuestionListEnabled,
      isNavigationArrowsEnabled,
      onSubmit,
      onValuesChange,
      form,
      locale,
      autoSave,
      allowPayment,
      sharedValues,
      ssr,
      query
    ]
  )
  const [state, dispatch] = useReducer(StoreReducer, memoState)
  const notifiedVersionRef = useRef(0)
  const sharedValuesRef = useRef(sharedValues)
  sharedValuesRef.current = sharedValues

  useEffect(() => {
    if (sharedValuesRef.current) {
      dispatch({
        type: 'syncValues',
        payload: { values: sharedValuesRef.current }
      })
    }
  }, [sharedRevision])

  useEffect(() => {
    if (
      onValuesChange &&
      state.changeVersion &&
      state.changeVersion !== notifiedVersionRef.current
    ) {
      notifiedVersionRef.current = state.changeVersion
      onValuesChange(state.changedValues || {})
    }
  }, [onValuesChange, state.changeVersion, state.changedValues])

  useEffect(() => {
    if (sharedSubmitted && !state.isSubmitted) {
      dispatch({
        type: 'setIsSubmitted',
        payload: {
          isSubmitted: true,
          thankYouFieldId: state.thankYouFields[0]?.id
        }
      })
    }
  }, [sharedSubmitted, state.isSubmitted, state.thankYouFields])

  // Form suspended
  if (form.suspended) {
    return <SuspendedMessage />
  }

  // No questions in a form
  else if (!helper.isValidArray(form.fields)) {
    return <ClosedMessage form={form} />
  }

  useEffect(() => {
    if (allowPayment) {
      const paymentField = memoState.fields.find(f => f.kind === FieldKindEnum.PAYMENT)

      if (paymentField) {
        const stripe = (window as any).Stripe(stripeApiKey, {
          stripeAccount: stripeAccountId
        })

        dispatch({
          type: 'setStripe',
          payload: {
            stripe: {
              elements: stripe.elements({ locale: memoState.locale }),
              confirmCardPayment: stripe.confirmCardPayment.bind(stripe),
              apiKey: stripeApiKey,
              accountId: stripeAccountId
            }
          }
        })
      }
    }
  }, [])

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      <Tooltip.Provider delayDuration={100}>
        <div
          className={clsx(
            'heyform-root',
            {
              'heyform-root-open': state.isSidebarOpen,
              'heyform-root-android': isAndroid
            },
            className
          )}
        >
          <div
            className={clsx('heyform-wrapper', {
              'heyform-is-welcome': !state.isStarted && state.welcomeField
            })}
          >
            <Blocks />
          </div>
          {enableQuestionList && <Sidebar />}
        </div>
      </Tooltip.Provider>
    </StoreContext.Provider>
  )
}
