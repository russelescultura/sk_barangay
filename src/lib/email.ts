import fs from 'fs'
import path from 'path'

import nodemailer from 'nodemailer'

interface SubmissionStatusEmailData {
  recipientEmail: string
  recipientName: string
  submissionTitle: string
  formTitle: string
  eventName?: string
  eventDate?: string
  status: 'APPROVED' | 'REJECTED'
  reviewerName: string
  reviewDate: string
  notes?: string
}

function decodeEnvFile(filePath: string): string | null {
  try {
    const buf = fs.readFileSync(filePath)
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
      // UTF-16LE with BOM
      return buf.toString('utf16le')
    }
    if (buf.length >= 2 && buf[0] === 0xfe && buf[1] === 0xff) {
      // UTF-16BE with BOM -> convert to LE
      const swapped = Buffer.allocUnsafe(buf.length - 2)
      for (let i = 2; i + 1 < buf.length; i += 2) {
        const destIndex = i - 2
        const hi = buf[i + 1] ?? 0
        const lo = buf[i] ?? 0
        swapped[destIndex] = hi
        swapped[destIndex + 1] = lo
      }
      return swapped.toString('utf16le')
    }
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      return buf.slice(3).toString('utf8')
    }
    return buf.toString('utf8')
  } catch {
    return null
  }
}

function readEnvFiles(): Record<string, string> {
  const result: Record<string, string> = {}
  const files = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env')
  ]
  for (const file of files) {
    try {
      if (!fs.existsSync(file)) continue
      const content = decodeEnvFile(file)
      if (!content) continue
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.replace(/^\uFEFF/, '').trim()
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
    } catch {}
  }
  return result
}

class EmailService {
  private transporter?: nodemailer.Transporter

  private getTransporter(): nodemailer.Transporter | null {
    let user = process.env.GMAIL_USER
    let pass = process.env.GMAIL_APP_PASSWORD

    if (!user || !pass) {
      const envFromFiles = readEnvFiles()
      user = user || envFromFiles['GMAIL_USER']
      pass = pass || envFromFiles['GMAIL_APP_PASSWORD']
    }

    console.log('Email service config:', {
      user,
      pass: pass ? '***SET***' : '***NOT SET***'
    })

    if (!user || !pass) {
      return null
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user, pass },
      })
    }

    return this.transporter
  }

  async sendSubmissionStatusEmail(data: SubmissionStatusEmailData): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      if (!transporter) {
        console.error('Email transporter not initialized. Missing GMAIL_USER or GMAIL_APP_PASSWORD.')
        return false
      }

      const { status, recipientEmail, recipientName, submissionTitle, formTitle, eventName, eventDate, reviewerName, reviewDate, notes } = data

      const statusText = status === 'APPROVED' ? 'approved' : 'rejected'
      const statusColor = status === 'APPROVED' ? '#10B981' : '#EF4444'
      const statusIcon = status === 'APPROVED' ? '✅' : '❌'

      const subject = `Your submission has been ${statusText} - ${submissionTitle}`

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Submission Status Update</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              margin: 10px 0;
            }
            .details {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${statusColor};
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background: ${statusColor};
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-weight: bold;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
                     <div class="header">
             <div style="text-align: center; margin-bottom: 20px;">
               <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Republic of the Philippines</h2>
               <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Province of Sorsogon</h2>
               <h2 style="margin: 0; font-size: 18px; font-weight: 600;">Municipality of Casiguran</h2>
               <h1 style="margin: 10px 0; font-size: 24px; font-weight: 700;">BARANGAY TULAY</h1>
               <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Sangguniang Kabataan</h3>
             </div>
             <div style="text-align: center; border-top: 2px solid rgba(255,255,255,0.3); padding-top: 20px;">
               <h1 style="margin: 0; font-size: 20px;">${statusIcon} Submission Status Update</h1>
               <p style="margin: 10px 0 0 0; opacity: 0.9;">Your submission has been reviewed and processed</p>
             </div>
           </div>
          
          <div class="content">
            <h2>Hello ${recipientName},</h2>
            
            <p>Your submission has been <strong>${statusText}</strong> by our review team.</p>
            
            <div class="status-badge" style="background-color: ${statusColor}">
              ${status.toUpperCase()}
            </div>
            
                         <div class="details">
               <h3>Submission Details:</h3>
               <ul>
                 <li><strong>Form:</strong> ${formTitle}</li>
                 <li><strong>Submission:</strong> ${submissionTitle}</li>
                 ${eventName ? `<li><strong>Event:</strong> ${eventName}</li>` : ''}
                 ${eventDate ? `<li><strong>Event Date:</strong> ${eventDate}</li>` : ''}
                 <li><strong>Reviewed by:</strong> ${reviewerName}</li>
                 <li><strong>Review date:</strong> ${reviewDate}</li>
                 ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
               </ul>
             </div>
            
            ${status === 'REJECTED' ? `
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #dc2626;">
                  <strong>Note:</strong> If you have any questions about this decision, please contact the review team.
                </p>
              </div>
            ` : ''}
            
            ${status === 'APPROVED' ? `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;">
                  <strong>Congratulations!</strong> Your submission has been approved. You will receive further instructions soon.
                </p>
              </div>
            ` : ''}
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
              View Dashboard
            </a>
          </div>
          
                     <div class="footer">
             <div style="text-align: center; margin-bottom: 20px;">
               <p style="margin: 0; font-weight: bold; color: #374151; font-size: 16px;">Thank you.</p>
               <p style="margin: 5px 0 0 0; font-weight: bold; color: #374151; font-size: 16px;">Sangguniang Kabataan</p>
               <p style="margin: 5px 0 0 0; font-weight: 600; color: #374151; font-size: 14px;">Barangay Tulay, Casiguran, Sorsogon</p>
             </div>
             <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; text-align: center;">
               <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated message from the SK Program Management System.</p>
               <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">Please do not reply to this email. For inquiries, contact the SK Office.</p>
             </div>
           </div>
        </body>
        </html>
      `

      const mailOptions = {
        from: `"Barangay Tulay Casiguran, Sorsogon - SK Program Management" <${process.env.GMAIL_USER}>`,
        to: recipientEmail,
        subject,
        html: htmlContent,
      }

      const result = await transporter.sendMail(mailOptions)
      console.log(`✅ Email sent successfully to ${recipientEmail}`)
      console.log(`📧 Email Details:`)
      console.log(`   - From: ${mailOptions.from}`)
      console.log(`   - To: ${recipientEmail}`)
      console.log(`   - Subject: ${mailOptions.subject}`)
      console.log(`   - Message ID: ${result.messageId}`)
      console.log(`   - Response: ${result.response}`)
      return true
    } catch (error) {
      console.error('Error sending email:', error)
      return false
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter()
      if (!transporter) {
        throw new Error('Missing GMAIL_USER or GMAIL_APP_PASSWORD')
      }
      await transporter.verify()
      console.log('Email service connection verified')
      return true
    } catch (error) {
      console.error('Email service connection failed:', error)
      return false
    }
  }
}

export const emailService = new EmailService()