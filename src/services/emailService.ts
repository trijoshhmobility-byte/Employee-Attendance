import { PendingRegistration } from '../types';

// Mock email service for demonstration
// In production, this would integrate with services like SendGrid, AWS SES, etc.
class EmailService {
  private static instance: EmailService;
  private readonly FROM_EMAIL = 'noreply@trijoshh.com';
  private readonly COMPANY_NAME = 'TRIJOSHH';

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Mock email sending function
  public async sendVerificationEmail(
    email: string, 
    verificationCode: string, 
    name: string,
    registrationType: 'employee' | 'admin'
  ): Promise<boolean> {
    try {
      // In a real implementation, this would call your email service API
      console.log(`📧 Sending verification email to: ${email}`);
      console.log(`🔐 Verification Code: ${verificationCode}`);
      
      // Simulate email sending with mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in localStorage for demo purposes (simulating email delivery)
      const emailData = {
        to: email,
        from: this.FROM_EMAIL,
        subject: `${this.COMPANY_NAME} - Verify Your Registration`,
        body: this.generateEmailTemplate(name, verificationCode, registrationType),
        timestamp: new Date().toISOString()
      };
      
      const sentEmails = JSON.parse(localStorage.getItem('trijoshh_sent_emails') || '[]');
      sentEmails.push(emailData);
      localStorage.setItem('trijoshh_sent_emails', JSON.stringify(sentEmails));
      
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  public async sendWelcomeEmail(employee: any): Promise<boolean> {
    try {
      console.log(`📧 Sending welcome email to: ${employee.email}`);
      
      const emailData = {
        to: employee.email,
        from: this.FROM_EMAIL,
        subject: `Welcome to ${this.COMPANY_NAME}!`,
        body: this.generateWelcomeTemplate(employee),
        timestamp: new Date().toISOString()
      };
      
      const sentEmails = JSON.parse(localStorage.getItem('trijoshh_sent_emails') || '[]');
      sentEmails.push(emailData);
      localStorage.setItem('trijoshh_sent_emails', JSON.stringify(sentEmails));
      
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  private generateEmailTemplate(
    name: string, 
    verificationCode: string, 
    type: 'employee' | 'admin'
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Registration</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .verification-code { background: #007bff; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 6px; margin: 20px 0; letter-spacing: 3px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.COMPANY_NAME}</h1>
              <p>Employee Attendance Tracker</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering as ${type === 'admin' ? 'an Administrator' : 'an Employee'} with ${this.COMPANY_NAME}.</p>
              <p>To complete your registration, please use the following verification code:</p>
              
              <div class="verification-code">${verificationCode}</div>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This code will expire in 15 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this registration, please ignore this email</li>
              </ul>
              
              <p>Once verified, you'll be able to access the attendance tracking system with your credentials.</p>
            </div>
            <div class="footer">
              <p>© 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeTemplate(employee: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to ${this.COMPANY_NAME}!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; text-align: center; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${this.COMPANY_NAME}!</h1>
              <p>Your account has been successfully created</p>
            </div>
            <div class="content">
              <h2>Hello ${employee.name}!</h2>
              <p>Your registration has been completed successfully. Here are your account details:</p>
              
              <div class="info-box">
                <strong>Your Account Information:</strong><br>
                Employee ID: <strong>${employee.employeeId}</strong><br>
                Email: <strong>${employee.email}</strong><br>
                Department: <strong>${employee.department}</strong><br>
                Position: <strong>${employee.position}</strong><br>
                Role: <strong>${employee.role}</strong>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>You can now log in using your Employee ID and password</li>
                <li>Complete your profile information in the dashboard</li>
                <li>Familiarize yourself with the attendance tracking system</li>
                <li>Contact IT support if you need any assistance</li>
              </ol>
              
              <p>We're excited to have you join our team!</p>
            </div>
            <div class="footer">
              <p>© 2024 ${this.COMPANY_NAME}. All rights reserved.</p>
              <p>For support, contact: it-support@trijoshh.com</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Method to retrieve sent emails (for demo purposes)
  public getSentEmails(): any[] {
    return JSON.parse(localStorage.getItem('trijoshh_sent_emails') || '[]');
  }

  // Method to clear email history (for demo purposes)
  public clearEmailHistory(): void {
    localStorage.removeItem('trijoshh_sent_emails');
  }
}

export default EmailService;