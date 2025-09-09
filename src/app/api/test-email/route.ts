import fs from 'fs'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

import { emailService } from '@/lib/email'

export const runtime = 'nodejs'

function readEnvFiles(): Record<string, string> {
  const result: Record<string, string> = {}
  const files = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ]
  for (const file of files) {
    try {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf-8')
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) continue
          const idx = trimmed.indexOf('=')
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim()
            const value = trimmed.slice(idx + 1).trim()
            if (!(key in result)) {
              result[key] = value
            }
          }
        }
      }
    } catch {}
  }
  return result
}

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email)
}

async function resolveInputRecipient(request: NextRequest): Promise<{ recipient: string | null; source: string }> {
  // 1) Query params
  const url = new URL(request.url)
  const qpKeys = ['to', 'email', 'recipient', 'recipientEmail']
  for (const k of qpKeys) {
    const v = url.searchParams.get(k)
    if (v && v.trim()) return { recipient: v.trim(), source: `query:${k}` }
  }

  // 2) JSON body
  try {
    const body = await request.json().catch(() => null)
    if (body && typeof body === 'object') {
      for (const k of qpKeys) {
        const v = (body as any)[k]
        if (typeof v === 'string' && v.trim()) return { recipient: v.trim(), source: `json:${k}` }
      }
    }
  } catch {}

  // 3) formData (application/x-www-form-urlencoded or multipart/form-data)
  try {
    const form = await request.formData()
    for (const k of qpKeys) {
      const v = form.get(k)
      if (typeof v === 'string' && v.trim()) return { recipient: v.trim(), source: `form:${k}` }
    }
  } catch {}

  // 4) Raw text (e.g., "to=someone@example.com" or plain email string)
  try {
    const text = await request.text()
    if (text && text.trim()) {
      const t = text.trim()
      // try key=value
      const m = t.match(/(?:^|&)\s*(to|email|recipient|recipientEmail)\s*=\s*([^&\s]+)\s*(?:&|$)/i)
      if (m && m[2]) return { recipient: m[2].trim(), source: 'text:k=v' }
      // fallback: plain email
      if (isValidEmail(t)) return { recipient: t, source: 'text:plain' }
    }
  } catch {}

  return { recipient: null, source: 'unresolved' }
}

export async function GET(request: NextRequest) {
  let user = process.env.GMAIL_USER
  let pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    const envFromFiles = readEnvFiles()
    user = user || envFromFiles['GMAIL_USER']
    pass = pass || envFromFiles['GMAIL_APP_PASSWORD']
    if (user && !process.env.GMAIL_USER) process.env.GMAIL_USER = user
    if (pass && !process.env.GMAIL_APP_PASSWORD) process.env.GMAIL_APP_PASSWORD = pass
  }

  const baseDiag: any = {
    config: {
      gmailUser: user ? 'SET' : 'NOT SET',
      gmailAppPassword: pass ? 'SET' : 'NOT SET'
    },
    attempts: [] as any[],
  }

  if (!user || !pass) {
    return NextResponse.json({ success: false, message: 'Missing Gmail credentials', ...baseDiag }, { status: 200 })
  }

  const { recipient, source } = await resolveInputRecipient(request)
  if (!recipient || !isValidEmail(recipient)) {
    return NextResponse.json({ success: false, message: "Provide valid recipient via '?to=' or POST JSON { to }", recipient, source, ...baseDiag }, { status: 200 })
  }

  const connectionTest = await emailService.testConnection()
  baseDiag.serviceVerify = connectionTest

  if (!connectionTest) {
    try {
      const t1 = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
      await t1.verify()
      baseDiag.attempts.push({ strategy: 'service:gmail', verify: true })
    } catch (e: any) {
      baseDiag.attempts.push({ strategy: 'service:gmail', verify: false, error: e?.message || String(e) })
    }

    try {
      const t2 = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, auth: { user, pass } })
      await t2.verify()
      baseDiag.attempts.push({ strategy: 'smtp.gmail.com:465', verify: true })
    } catch (e: any) {
      baseDiag.attempts.push({ strategy: 'smtp.gmail.com:465', verify: false, error: e?.message || String(e) })
    }

    try {
      const t3 = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 587, secure: false, auth: { user, pass } })
      await t3.verify()
      baseDiag.attempts.push({ strategy: 'smtp.gmail.com:587', verify: true })
    } catch (e: any) {
      baseDiag.attempts.push({ strategy: 'smtp.gmail.com:587', verify: false, error: e?.message || String(e) })
    }
  }

  const testEmailData = {
    recipientEmail: recipient,
    recipientName: 'Test Recipient',
    submissionTitle: 'Test Submission',
    formTitle: 'Test Form',
    eventName: 'Test Event',
    eventDate: new Date().toLocaleDateString(),
    status: 'APPROVED' as const,
    reviewerName: 'Test Admin',
    reviewDate: new Date().toLocaleDateString(),
    notes: 'This is a test email to verify the email service is working.'
  }

  const emailSent = await emailService.sendSubmissionStatusEmail(testEmailData)
  const payload = { success: emailSent, message: emailSent ? 'Email sent' : 'Email failed', recipient, source, ...baseDiag }
  return NextResponse.json(payload, { status: 200 })
}

export async function POST(request: NextRequest) {
  return GET(request)
}
