import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// SMTP config from environment variables
const smtpConfig = {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: process.env.EMAIL_SERVICE || 'gmail'
};

// Create transporter ONCE and reuse it (major performance improvement)
let transporter = null;

function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: smtpConfig.service,
            auth: {
                user: smtpConfig.user,
                pass: smtpConfig.pass
            },
            pool: true, // Use connection pooling
            maxConnections: 5, // Max concurrent connections
            maxMessages: 100, // Max messages per connection
            rateDelta: 1000, // Rate limiting: time window in ms
            rateLimit: 10 // Max messages per rateDelta
        });

        // Verify transporter on creation
        transporter.verify((error) => {
            if (error) {
                console.error('SMTP connection error:', error);
            } else {
                console.log('SMTP server is ready to send emails');
            }
        });
    }
    return transporter;
}

// Helper function to prepare attachments (optimized)
function prepareAttachments(attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) {
        return undefined;
    }

    return attachments.map((attachment) => {
        const {
            fileName,
            content,
            encoding = 'base64',
            contentType = 'application/octet-stream'
        } = attachment;

        const attachmentObj = {
            filename: fileName,
            contentType: contentType
        };

        // Optimize buffer handling
        if (Buffer.isBuffer(content)) {
            attachmentObj.content = content;
        } else if (encoding === 'base64' && typeof content === 'string') {
            attachmentObj.content = Buffer.from(content, 'base64');
        } else {
            attachmentObj.content = content;
            attachmentObj.encoding = encoding;
        }

        return attachmentObj;
    });
}

async function sendEmail({
    to, 
    subject, 
    text, 
    html, 
    attachments = [], 
}) {
    try {
        // Input validation
        if (!to || !subject) {
            throw new Error('Missing required fields: to, subject');
        }

        // Prepare recipients (optimized)
        const recipients = Array.isArray(to) ? to.join(', ') : to;

        // Prepare mail options
        const mailOptions = {
            from: smtpConfig.from,
            to: recipients,
            subject: subject
        };

        // Only add fields if they exist (cleaner)
        if (text) mailOptions.text = text;
        if (html) mailOptions.html = html;
        
        const preparedAttachments = prepareAttachments(attachments);
        if (preparedAttachments) {
            mailOptions.attachments = preparedAttachments;
        }

        // Use reusable transporter instead of creating new one each time
        const transport = getTransporter();

        // Send email using async/await instead of Promise wrapper
        const info = await transport.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

// Batch email sending for multiple recipients (new feature)
async function sendBatchEmails(emails) {
    const results = await Promise.allSettled(
        emails.map(email => sendEmail(email))
    );
    
    return results.map((result, index) => ({
        email: emails[index].to,
        status: result.status,
        value: result.status === 'fulfilled' ? result.value : null,
        error: result.status === 'rejected' ? result.reason : null
    }));
}

// Graceful shutdown - close transporter when app terminates
function closeTransporter() {
    if (transporter) {
        transporter.close();
        console.log('Email transporter closed');
    }
}

export default sendEmail;
export { sendBatchEmails, closeTransporter };



// // Single email (same as before)
// await sendEmail({
//     to: 'user@example.com',
//     subject: 'Welcome!',
//     html: '<h1>Hello</h1>'
// });

// // Batch emails (new feature)
// const emails = [
//     { to: 'user1@example.com', subject: 'Hi 1', text: 'Message 1' },
//     { to: 'user2@example.com', subject: 'Hi 2', text: 'Message 2' }
// ];
// const results = await sendBatchEmails(emails);

// // Graceful shutdown (add to your app's shutdown handler)
// process.on('SIGTERM', () => {
//     closeTransporter();
//     process.exit(0);
// });