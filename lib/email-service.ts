import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendAccountCreationEmail(email: string, token: string, plan: string) {
  const createAccountUrl = `${process.env.NEXT_PUBLIC_APP_URL}/create-account?token=${token}`

  const planNames = {
    basic: "Basic Plan",
    monthly: "Monthly Plan",
    premium: "Premium Plan",
    ultimate: "Ultimate Plan",
  }

  const planName = planNames[plan as keyof typeof planNames] || "Basic Plan"

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Create Your Account</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VideoEdit Pro!</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your payment was successful</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Create Your Account</h2>
        
        <p>Thank you for subscribing to our <strong>${planName}</strong>! Your payment has been processed successfully.</p>
        
        <p>To complete your setup and start using your account, please click the button below to create your login credentials:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${createAccountUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    display: inline-block;
                    font-size: 16px;">
            Create My Account
          </a>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">Your Plan Details:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Plan:</strong> ${planName}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Status:</strong> Active</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          <strong>Important:</strong> This link will expire in 24 hours for security reasons. 
          If you don't create your account within this time, please contact our support team.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666; text-align: center;">
          If you didn't make this purchase, please contact us immediately at 
          <a href="mailto:support@videoedit.pro" style="color: #667eea;">support@videoedit.pro</a>
        </p>
        
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 20px;">
          © 2024 VideoEdit Pro. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `

  const textContent = `
    Welcome to VideoEdit Pro!
    
    Thank you for subscribing to our ${planName}! Your payment has been processed successfully.
    
    To complete your setup and start using your account, please visit this link to create your login credentials:
    ${createAccountUrl}
    
    Your Plan Details:
    - Plan: ${planName}
    - Email: ${email}
    - Status: Active
    
    Important: This link will expire in 24 hours for security reasons.
    
    If you didn't make this purchase, please contact us immediately at support@videoedit.pro
    
    © 2024 VideoEdit Pro. All rights reserved.
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: "Create Your VideoEdit Pro Account - Payment Confirmed",
      text: textContent,
      html: htmlContent,
    })

    console.log(`Account creation email sent to ${email}`)
  } catch (error) {
    console.error("Failed to send account creation email:", error)
    throw error
  }
}

export async function sendWelcomeEmail(email: string, name: string, plan: string) {
  const planNames = {
    basic: "Basic Plan",
    monthly: "Monthly Plan",
    premium: "Premium Plan",
    ultimate: "Ultimate Plan",
  }

  const planName = planNames[plan as keyof typeof planNames] || "Basic Plan"

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to VideoEdit Pro</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome, ${name}!</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Your account is ready to use</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">You're All Set!</h2>
        
        <p>Your VideoEdit Pro account has been successfully created with the <strong>${planName}</strong>.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 15px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    display: inline-block;
                    font-size: 16px;">
            Access Dashboard
          </a>
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Upload your first video project</li>
            <li>Explore your plan features</li>
            <li>Set up your profile preferences</li>
            <li>Invite team members (if available in your plan)</li>
          </ul>
        </div>
        
        <p>If you have any questions or need help getting started, our support team is here to help at 
           <a href="mailto:support@videoedit.pro" style="color: #667eea;">support@videoedit.pro</a></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          © 2024 VideoEdit Pro. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `

  const textContent = `
    Welcome to VideoEdit Pro, ${name}!
    
    Your account has been successfully created with the ${planName}.
    
    What's Next?
    - Upload your first video project
    - Explore your plan features
    - Set up your profile preferences
    - Invite team members (if available in your plan)
    
    Access your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
    
    If you have any questions or need help getting started, our support team is here to help at support@videoedit.pro
    
    © 2024 VideoEdit Pro. All rights reserved.
  `

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: `Welcome to VideoEdit Pro, ${name}!`,
      text: textContent,
      html: htmlContent,
    })

    console.log(`Welcome email sent to ${email}`)
  } catch (error) {
    console.error("Failed to send welcome email:", error)
    throw error
  }
}
