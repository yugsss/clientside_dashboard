import nodemailer from 'nodemailer'

interface SecureSignupEmailData {
  email: string
  planId: string
  signupToken: string
  expiresAt: Date
}

// Create transporter with your SMTP settings
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Add these for better compatibility
    tls: {
      rejectUnauthorized: false
    }
  }

  console.log('Email config:', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    // Don't log password
  })

  return nodemailer.createTransport(config)
}

export async function sendSecureSignupEmail(data: SecureSignupEmailData) {
  const { email, planId, signupToken, expiresAt } = data
  
  console.log('Attempting to send email to:', email)
  
  const signupUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${signupToken}`
  
  const planNames = {
    basic: 'Basic Plan ($45)',
    monthly_pass: 'Monthly Pass ($350)', 
    premium: 'Premium Plan ($500)',
    ultimate: 'Ultimate Plan ($999)'
  }
  
  const planName = planNames[planId as keyof typeof planNames] || 'Selected Plan'
  
  const transporter = createTransporter()
  
  const mailOptions = {
    from: `"EditLobby" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: 'Welcome to EditLobby - Complete Your Account Setup',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EditLobby</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .header p { color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; color: #856404; }
            .footer { border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to EditLobby!</h1>
              <p>Professional Video Editing Service</p>
            </div>
            
            <div class="content">
              <h2>Thank you for your purchase!</h2>
              
              <div class="plan-details">
                <h3 style="margin-top: 0; color: #667eea;">Plan Details</h3>
                <p><strong>Plan:</strong> ${planName}</p>
                <p><strong>Email:</strong> ${email}</p>
              </div>
              
              <p>Your payment has been successfully processed. To complete your account setup and start uploading your first project, please click the secure link below:</p>
              
              <div style="text-align: center;">
                <a href="${signupUrl}" class="cta-button">Complete Account Setup</a>
              </div>
              
              <div class="warning">
                <p style="margin: 0;"><strong>Important:</strong> This secure link expires in 24 hours (${expiresAt.toLocaleString()}). Please complete your account setup before then.</p>
              </div>
              
              <h3>What happens next?</h3>
              <ol>
                <li>Click the secure link above to create your account</li>
                <li>Access your personalized dashboard</li>
                <li>Upload your first project with Google Drive link</li>
                <li>Our team will assign a professional editor</li>
                <li>Track progress and review via Frame.io integration</li>
              </ol>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <div class="footer">
                <p>EditLobby - Professional Video Editing Service</p>
                <p>If you didn't make this purchase, please contact us immediately.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }
  
  try {
    // Test the connection first
    await transporter.verify()
    console.log('SMTP connection verified successfully')
    
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error(`Email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function sendNotificationEmail(to: string, subject: string, content: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html: content
  }
  
  const transporter = createTransporter()
  
  try {
    await transporter.sendMail(mailOptions)
    console.log('Notification email sent successfully to:', to)
  } catch (error) {
    console.error('Failed to send notification email:', error)
    throw new Error(`Notification email sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function testEmailConnection() {
  try {
    const transporter = createTransporter()
    await transporter.verify()
    console.log('✅ SMTP connection test successful')
    return true
  } catch (error) {
    console.error('❌ SMTP connection test failed:', error)
    return false
  }
}
