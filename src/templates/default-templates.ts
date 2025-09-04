export const defaultEmailTemplates = [
  {
    name: 'welcome',
    subject: 'Welcome to NeoVantis, {{name}}!',
    textContent: `Dear {{name}},

Welcome to NeoVantis! We're excited to have you on board.

Your account has been successfully created with the email: {{email}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The NeoVantis Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to NeoVantis!</h1>
        </div>
        <div class="content">
            <p>Dear {{name}},</p>
            <p>Welcome to NeoVantis! We're excited to have you on board.</p>
            <p>Your account has been successfully created with the email: <strong>{{email}}</strong></p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The NeoVantis Team</p>
        </div>
    </div>
</body>
</html>`,
    description: 'Welcome email template for new users',
    requiredVariables: ['name', 'email'],
    category: 'onboarding',
    defaultData: {
      name: 'User',
      email: 'user@example.com',
    },
  },
  {
    name: 'password-reset',
    subject: 'Password Reset Request for {{email}}',
    textContent: `Hello {{name}},

You have requested to reset your password for your NeoVantis account.

Your password reset code is: {{resetCode}}

This code will expire in {{expirationTime}} minutes.

If you did not request this password reset, please ignore this email.

Best regards,
The NeoVantis Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF6B6B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { background-color: #e7e7e7; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; }
        .warning { color: #d73502; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello {{name}},</p>
            <p>You have requested to reset your password for your NeoVantis account.</p>
            <div class="code">{{resetCode}}</div>
            <p>This code will expire in <strong>{{expirationTime}} minutes</strong>.</p>
            <p class="warning">If you did not request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The NeoVantis Team</p>
        </div>
    </div>
</body>
</html>`,
    description: 'Password reset email template with OTP code',
    requiredVariables: ['name', 'email', 'resetCode', 'expirationTime'],
    category: 'security',
    defaultData: {
      name: 'User',
      email: 'user@example.com',
      resetCode: '123456',
      expirationTime: '10',
    },
  },
  {
    name: 'email-verification',
    subject: 'Verify Your Email Address',
    textContent: `Hello {{name}},

Please verify your email address to complete your NeoVantis account setup.

Your verification code is: {{verificationCode}}

This code will expire in {{expirationTime}} minutes.

If you did not create this account, please ignore this email.

Best regards,
The NeoVantis Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4ECDC4; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { background-color: #e7e7e7; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hello {{name}},</p>
            <p>Please verify your email address to complete your NeoVantis account setup.</p>
            <div class="code">{{verificationCode}}</div>
            <p>This code will expire in <strong>{{expirationTime}} minutes</strong>.</p>
            <p>If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The NeoVantis Team</p>
        </div>
    </div>
</body>
</html>`,
    description: 'Email verification template for new registrations',
    requiredVariables: ['name', 'verificationCode', 'expirationTime'],
    category: 'verification',
    defaultData: {
      name: 'User',
      verificationCode: '123456',
      expirationTime: '10',
    },
  },
  {
    name: 'notification',
    subject: '{{subject}}',
    textContent: `Hello {{name}},

{{message}}

{{#if actionRequired}}
Action Required: {{actionRequired}}
{{/if}}

{{#if link}}
Visit: {{link}}
{{/if}}

Best regards,
The NeoVantis Team`,
    htmlContent: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #45B7D1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .action { background-color: #ffeaa7; padding: 15px; margin: 20px 0; border-left: 4px solid #fdcb6e; }
        .link { text-align: center; margin: 20px 0; }
        .button { display: inline-block; background-color: #45B7D1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
        .footer { padding: 20px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{subject}}</h1>
        </div>
        <div class="content">
            <p>Hello {{name}},</p>
            <p>{{message}}</p>
            {{#if actionRequired}}
            <div class="action">
                <strong>Action Required:</strong> {{actionRequired}}
            </div>
            {{/if}}
            {{#if link}}
            <div class="link">
                <a href="{{link}}" class="button">Take Action</a>
            </div>
            {{/if}}
        </div>
        <div class="footer">
            <p>Best regards,<br>The NeoVantis Team</p>
        </div>
    </div>
</body>
</html>`,
    description:
      'General notification template for various system notifications',
    requiredVariables: ['name', 'subject', 'message'],
    category: 'notification',
    defaultData: {
      name: 'User',
      subject: 'System Notification',
      message: 'This is a system notification.',
    },
  },
];
