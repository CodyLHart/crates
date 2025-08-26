import nodemailer from "nodemailer";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: `"Crates Music Collection" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Crates account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎵 Crates</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Music Collection</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to Crates!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              Thank you for creating an account with Crates. To complete your registration, 
              please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              This link will expire in 24 hours. If you didn't create an account with Crates, 
              you can safely ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 Crates. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Crates Music Collection" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your Crates password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎵 Crates</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Music Collection</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 25px;">
              You requested to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 500; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
              This link will expire in 1 hour.
            </p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              © 2024 Crates. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
}

export default new EmailService();
