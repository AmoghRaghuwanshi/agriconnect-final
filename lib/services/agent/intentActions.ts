/**
 * Maps voice intents to navigation actions.
 * Returns a path with optional query params for form prefill.
 */

import type { IntentResult } from './ruleBasedFallback';

export interface VoiceAction {
  type: 'navigate' | 'show_help';
  path?: string;
}

export function getIntentAction(result: IntentResult): VoiceAction {
  const { intent, params } = result;

  switch (intent) {
    case 'CREATE_LISTING': {
      const qp = new URLSearchParams();
      if (params.crop_name) qp.set('crop', String(params.crop_name));
      if (params.variety) qp.set('variety', String(params.variety));
      if (params.quantity_kg) qp.set('qty', String(params.quantity_kg));
      if (params.price_per_kg) qp.set('price', String(params.price_per_kg));
      if (params.organic) qp.set('organic', '1');
      if (params.min_order_kg) qp.set('minOrder', String(params.min_order_kg));
      if (params.storage_type) qp.set('storage', String(params.storage_type));
      if (params.duration_days) qp.set('duration', String(params.duration_days));
      if (params.description) qp.set('desc', String(params.description));
      const qs = qp.toString();
      return { type: 'navigate', path: `/farmer/listings/new${qs ? `?${qs}` : ''}` };
    }

    case 'CHECK_MANDI_PRICE': {
      const mqp = new URLSearchParams();
      if (params.crop_name) mqp.set('crop', String(params.crop_name));
      const mqs = mqp.toString();
      return { type: 'navigate', path: `/mandi${mqs ? `?${mqs}` : ''}` };
    }

    case 'PRICE_FORECAST': {
      const fqp = new URLSearchParams();
      if (params.crop_name) fqp.set('crop', String(params.crop_name));
      const fqs = fqp.toString();
      return { type: 'navigate', path: `/farmer/forecast${fqs ? `?${fqs}` : ''}` };
    }

    case 'CHECK_WEATHER':
      return { type: 'navigate', path: '/farmer/weather' };

    case 'NAVIGATE_DASHBOARD':
      return { type: 'navigate', path: '/farmer/dashboard' };

    case 'NAVIGATE_LISTINGS':
      return { type: 'navigate', path: '/farmer/listings' };

    case 'VIEW_ORDERS':
      return { type: 'navigate', path: '/farmer/orders' };

    case 'MARK_OUT_FOR_DELIVERY':
      return { type: 'navigate', path: '/farmer/orders' };

    case 'VIEW_INCOME':
      return { type: 'navigate', path: '/farmer/income' };

    case 'VIEW_SCORE':
      return { type: 'navigate', path: '/farmer/score' };

    case 'PAUSE_LISTING':
      return { type: 'navigate', path: '/farmer/listings' };

    case 'RESUME_LISTING':
      return { type: 'navigate', path: '/farmer/listings' };

    case 'EDIT_PRICE': {
      const eqp = new URLSearchParams();
      if (params.crop_name) eqp.set('crop', String(params.crop_name));
      if (params.variety) eqp.set('variety', String(params.variety));
      const eqs = eqp.toString();
      return { type: 'navigate', path: `/farmer/listings${eqs ? `?${eqs}` : ''}` };
    }

    case 'HELP':
    default:
      return { type: 'show_help' };
  }
}
