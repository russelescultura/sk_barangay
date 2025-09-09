import fs from 'fs'
import path from 'path'

import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(req: NextRequest) {
  const cwd = process.cwd()
  const envLocalPath = path.join(cwd, '.env.local')
  const envPath = path.join(cwd, '.env')

  const exists = {
    envLocalExists: fs.existsSync(envLocalPath),
    envExists: fs.existsSync(envPath),
  }

  const fromProcess = {
    GMAIL_USER: process.env.GMAIL_USER ? 'SET' : 'NOT SET',
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'UNKNOWN',
    CWD: cwd,
  }

  const fromFiles = readEnvFiles()

  return NextResponse.json({
    exists,
    fromProcess,
    fromFiles: {
      GMAIL_USER: fromFiles['GMAIL_USER'] ? 'SET' : 'NOT SET',
      GMAIL_APP_PASSWORD: fromFiles['GMAIL_APP_PASSWORD'] ? 'SET' : 'NOT SET',
    },
  })
}
