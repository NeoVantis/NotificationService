const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfiguration() {
  console.log('🔧 Starting Email Configuration Diagnostic...\n');

  // Display current configuration
  console.log('📧 Current Email Configuration:');
  console.log(`   Host: ${process.env.MAIL_HOST}`);
  console.log(`   Port: ${process.env.MAIL_PORT}`);
  console.log(`   Secure: ${process.env.MAIL_SECURE}`);
  console.log(`   User: ${process.env.MAIL_USER}`);
  console.log(
    `   Password: ${process.env.MAIL_PASSWORD ? '***hidden***' : 'NOT SET'}`,
  );
  console.log(`   From Name: ${process.env.MAIL_FROM_NAME}`);
  console.log(`   From Email: ${process.env.MAIL_FROM_EMAIL}\n`);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    debug: true, // Enable detailed logging
    logger: true, // Enable logging
  });

  try {
    // Test 1: Verify connection
    console.log('🔍 Test 1: Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully\n');

    // Test 2: Send test email
    console.log('🔍 Test 2: Sending test email...');
    const testEmail = {
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: 'vaidityatanwar2207@gmail.com',
      subject: `🧪 Email Test - ${new Date().toISOString()}`,
      text: `This is a test email sent at ${new Date().toISOString()} to verify email delivery.\n\nIf you receive this, the email system is working correctly!`,
      html: `
        <h2>🧪 Email Delivery Test</h2>
        <p>This is a test email sent at <strong>${new Date().toISOString()}</strong> to verify email delivery.</p>
        <p>If you receive this, the email system is working correctly!</p>
        <hr>
        <small>Sent from NeoVantis Notification Service</small>
      `,
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);

    if (info.accepted && info.accepted.length > 0) {
      console.log(`   Accepted: ${info.accepted.join(', ')}`);
    }

    if (info.rejected && info.rejected.length > 0) {
      console.log(`   Rejected: ${info.rejected.join(', ')}`);
    }

    console.log(
      '\n📬 Check your email inbox and spam folder for the test message.',
    );
  } catch (error) {
    console.error('❌ Email test failed:');
    console.error(`   Error: ${error.message}`);

    if (error.code) {
      console.error(`   Error Code: ${error.code}`);
    }

    if (error.response) {
      console.error(`   Server Response: ${error.response}`);
    }

    console.log('\n🔧 Troubleshooting suggestions:');

    if (error.message.includes('authentication')) {
      console.log('   • Check your Mailcow username and password');
      console.log('   • Verify the account is active in Mailcow admin panel');
      console.log('   • Check if 2FA is enabled (might need app password)');
    }

    if (
      error.message.includes('connection') ||
      error.message.includes('timeout')
    ) {
      console.log('   • Check if mail.neovantis.xyz is accessible');
      console.log('   • Try ping mail.neovantis.xyz');
      console.log('   • Check firewall settings');
      console.log('   • Try different port (587 with STARTTLS)');
    }

    if (
      error.message.includes('certificate') ||
      error.message.includes('SSL')
    ) {
      console.log('   • Try with MAIL_SECURE=false and port 587');
      console.log('   • Check SSL certificate validity');
    }
  }

  // Test 3: Alternative configuration
  console.log(
    '\n🔍 Test 3: Trying alternative SMTP configuration (port 587 with STARTTLS)...',
  );

  const altTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    debug: true,
    logger: true,
  });

  try {
    await altTransporter.verify();
    console.log('✅ Alternative SMTP configuration (port 587) works!');
    console.log(
      '   Consider updating your .env to use port 587 with MAIL_SECURE=false',
    );
  } catch (altError) {
    console.log('❌ Alternative configuration also failed');
    console.log(`   Error: ${altError.message}`);
  }

  transporter.close();
  altTransporter.close();
}

// Run the diagnostic
testEmailConfiguration().catch(console.error);
