import { existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import { join } from 'path'

import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { formId } = await request.json()

    if (!formId) {
      return NextResponse.json(
        { error: 'Form ID is required' },
        { status: 400 }
      )
    }

    // Fetch the form to verify it exists
    const form = await prisma.form.findUnique({
      where: { id: formId }
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    // Generate unique access link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const accessLink = `${baseUrl}/forms/${formId}`

    // Generate QR code
    const qrCodeBuffer = await QRCode.toBuffer(accessLink, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Save QR code to file
    const timestamp = Date.now()
    const fileName = `form-access-${formId}-${timestamp}.png`
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'form-qr-codes')
    
    // Ensure directory exists
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true })
    }

    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, qrCodeBuffer)

    // Generate the public URL for the QR code
    const qrCodeUrl = `/uploads/form-qr-codes/${fileName}`

    // Update the form with access link and QR code
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: {
        accessLink,
        accessQRCode: qrCodeUrl
      }
    })

    return NextResponse.json({
      success: true,
      accessLink,
      qrCodeUrl,
      form: updatedForm
    })

  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}