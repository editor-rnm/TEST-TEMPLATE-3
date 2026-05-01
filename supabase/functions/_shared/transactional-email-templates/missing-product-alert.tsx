/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface MissingProductAlertProps {
  creatorName?: string
  accountName?: string
  productName?: string
  assignmentDate?: string
  videoStyle?: string
  assignmentOrder?: string
  notes?: string
  reportedAt?: string
  replacementProduct?: string
}

const MissingProductAlertEmail = ({
  creatorName,
  accountName,
  productName,
  assignmentDate,
  videoStyle,
  assignmentOrder,
  notes,
  reportedAt,
  replacementProduct,
}: MissingProductAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Missing product reported{productName ? `: ${productName}` : ''}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚨 Missing Product Reported</Heading>
        <Text style={lead}>
          {creatorName || 'A creator'} reported they don't have a product
          assigned to them. Action may be required.
        </Text>

        <Section style={card}>
          <Row label="Product" value={productName || '—'} highlight />
          <Row label="Creator" value={creatorName || '—'} />
          <Row label="Account" value={accountName || '—'} />
          {assignmentDate ? <Row label="Assignment date" value={assignmentDate} /> : null}
          {assignmentOrder ? <Row label="Order #" value={`#${assignmentOrder}`} /> : null}
          {videoStyle ? <Row label="Video style" value={videoStyle} /> : null}
          {replacementProduct ? <Row label="Replaced with" value={replacementProduct} /> : null}
          {notes ? <Row label="Filming note" value={notes} /> : null}
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Reported at: {reportedAt || new Date().toISOString()}
        </Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) => (
  <Section style={{ marginBottom: '12px' }}>
    <Text style={rowLabel}>{label}</Text>
    <Text style={highlight ? rowValueHighlight : rowValue}>{value}</Text>
  </Section>
)

export const template = {
  component: MissingProductAlertEmail,
  subject: (data: Record<string, any>) =>
    `🚨 Missing product: ${data.productName || 'Unknown'} (${data.creatorName || 'Creator'})`,
  displayName: 'Missing product alert',
  to: 'annie.e.randle@gmail.com',
  previewData: {
    creatorName: 'Jane Doe',
    accountName: 'Acme Beauty',
    productName: 'Glow Serum',
    assignmentDate: '2026-04-25',
    videoStyle: 'BOF Face',
    assignmentOrder: '3',
    notes: 'Use the new packaging variant',
    reportedAt: new Date().toISOString(),
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}
const container = { padding: '24px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 12px',
}
const lead = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px 20px',
}
const rowLabel = {
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  color: '#64748b',
  margin: '0 0 2px',
  fontWeight: 600,
}
const rowValue = {
  fontSize: '14px',
  color: '#0f172a',
  margin: 0,
  lineHeight: '1.4',
}
const rowValueHighlight = {
  fontSize: '16px',
  color: '#dc2626',
  margin: 0,
  fontWeight: 'bold' as const,
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: 0 }