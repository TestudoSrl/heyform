import { apollo } from '@/utils'

import { CONNECT_STRIPE_GQL, REVOKE_STRIPE_ACCOUNT_GQL, STRIPE_AUTHORIZE_URL_GQL } from '@/consts'

export class PaymentService {
  static stripeAuthorizeUrl(formId: string) {
    return apollo.query({
      query: STRIPE_AUTHORIZE_URL_GQL,
      variables: {
        input: {
          formId
        }
      }
    })
  }

  static connectStripe(formId: string, state: string, code: string) {
    return apollo.mutate({
      mutation: CONNECT_STRIPE_GQL,
      variables: {
        input: {
          formId,
          state,
          code
        }
      }
    })
  }

  static revokeStripeAccount(formId: string) {
    return apollo.mutate({
      mutation: REVOKE_STRIPE_ACCOUNT_GQL,
      variables: {
        input: {
          formId
        }
      }
    })
  }
}
