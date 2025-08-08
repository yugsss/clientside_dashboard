import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  console.log('📧 Testing email configuration...')
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: parseInt(env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })

    // Verify connection
    console.log('🔍 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified')

    // Send test email
    const testEmail = {
      from: env.SMTP_FROM,
      to: env.SMTP_USER, // Send to self for testing
      subject: 'EditLobby Email Test - ' + new Date().toISOString(),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Configuration Test</h2>
          <p>This is a test email to verify your SMTP configuration is working correctly.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>SMTP Host:</strong> ${env.SMTP_HOST}</li>
              <li><strong>SMTP Port:</strong> ${env.SMTP_PORT}</li>
              <li><strong>SMTP User:</strong> ${env.SMTP_USER}</li>
              <li><strong>From Address:</strong> ${env.SMTP_FROM}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you received this email, your SMTP configuration is working correctly!
          </p>
        </div>
      `
    }

    console.log('📧 Sending test email...')
    const info = await transporter.sendMail(testEmail)
    console.log('✅ Test email sent:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      configuration: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        user: env.SMTP_USER,
        from: env.SMTP_FROM,
        secure: false
      }
    })

  } catch (error) {
    console.error('❌ Email test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      configuration: {
        host: env.SMTP_HOST || 'NOT_SET',
        port: env.SMTP_PORT || 'NOT_SET',
        user: env.SMTP_USER || 'NOT_SET',
        from: env.SMTP_FROM || 'NOT_SET',
        smtp_pass_configured: !!env.SMTP_PASS
      }
    }, { status: 500 })
  }
}
