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

interface MissingProductReversalProps {
  creatorName?: string
  accountName?: string
  productName?: string
  assignmentDate?: string
  videoStyle?: string
  assignmentOrder?: string
  resolutionNote?: string
  reversedAt?: string
}

const MissingProductReversalEmail = ({
  creatorName,
  accountName,
  productName,
  assignmentDate,
  videoStyle,
  assignmentOrder,
  resolutionNote,
  reversedAt,
}: MissingProductReversalProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Missing product update — found{productName ? `: ${productName}` : ''}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Missing Product — Resolved</Heading>
        <Text style={lead}>
          {creatorName || 'A creator'} updated a previous missing-product
          report. The product has been found or the report was reversed.
        </Text>

        <Section style={card}>
          <Row label="Product" value={productName || '—'} highlight />
          <Row label="Creator" value={creatorName || '—'} />
          <Row label="Account" value={accountName || '—'} />
          {assignmentDate ? <Row label="Assignment date" value={assignmentDate} /> : null}
          {assignmentOrder ? <Row label="Order #" value={`#${assignmentOrder}`} /> : null}
          {videoStyle ? <Row label="Video style" value={videoStyle} /> : null}
          {resolutionNote ? <Row label="Note" value={resolutionNote} /> : null}
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Reversed at: {reversedAt || new Date().toISOString()}
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
  component: MissingProductReversalEmail,
  subject: (data: Record<string, any>) =>
    `✅ Missing product resolved: ${data.productName || 'Unknown'} (${data.creatorName || 'Creator'})`,
  displayName: 'Missing product reversal',
  to: 'annie.e.randle@gmail.com',
  previewData: {
    creatorName: 'Jane Doe',
    accountName: 'Acme Beauty',
    productName: 'Glow Serum',
    assignmentDate: '2026-04-25',
    videoStyle: 'BOF Face',
    assignmentOrder: '3',
    resolutionNote: 'Found it in the back of the closet',
    reversedAt: new Date().toISOString(),
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
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
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
  color: '#16a34a',
  margin: 0,
  fontWeight: 'bold' as const,
}
const hr = { borderColor: '#e2e8f0', margin: '24px 0 12px' }
const footer = { fontSize: '12px', color: '#94a3b8', margin: 0 }