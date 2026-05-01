/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as missingProductAlert } from './missing-product-alert.tsx'
import { template as missingProductReversal } from './missing-product-reversal.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'missing-product-alert': missingProductAlert,
  'missing-product-reversal': missingProductReversal,
}