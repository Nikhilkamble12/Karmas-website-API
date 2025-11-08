import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); // Load env variables

// SMTP config from environment variables
const smtpConfig = {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    service: process.env.EMAIL_SERVICE || 'gmail'
  };

async function sendEmail({
    to, 
    subject, 
    text, 
    html, 
    attachments = [], 
}) {
    console.log("smtpConfig",smtpConfig)
    try {
        // Ensure the 'to' field can handle both string and array of recipients
        const recipients = Array.isArray(to) ? to.join(', ') : to;

        // Prepare the email options
        const mailOptions = {
            from: smtpConfig.from, // Your "from" email
            to: recipients,
            subject: subject,
            text: text ?? null,
            html: html ?? null,
            ...(Array.isArray(attachments) && attachments.length > 0 && {
                attachments: prepareAttachments(attachments)
            })
            
        };

        // Create a transporter object using the provided SMTP config
        const transporter = nodemailer.createTransport({
            service: smtpConfig.service || 'gmail', // Default to Gmail if no service provided
            auth: {
                user: smtpConfig.user, // Your SMTP username (email)
                pass: smtpConfig.pass  // Your SMTP password (app password or regular password)
            }
        });

        // Send the email
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return reject(error); // Reject promise if there is an error
                }
                console.log('Email sent successfully:', info.response);
                return resolve(info); // Resolve with the send info on success
            });
        });

    } catch (error) {
        console.error('Error in sendEmail function:', error);
        throw error; // Propagate error to the caller
    }
}

// Helper function to handle the preparation of attachments
function prepareAttachments(attachments) {
    if (!Array.isArray(attachments) || attachments.length === 0) {
        return undefined; // Or return [] depending on how you want to handle empty attachments
    }

    return attachments.map((attachment) => {
        const {
            fileName,
            content,
            encoding = 'base64',
            contentType = 'application/octet-stream'
        } = attachment;

        let attachmentObj = {
            filename: fileName,
            content: content,
            encoding: encoding,
            contentType: contentType
        };

        if (encoding === 'base64' && typeof content === 'string') {
            attachmentObj.content = Buffer.from(content, 'base64');
        }

        if (Buffer.isBuffer(content)) {
            attachmentObj.content = content;
        }

        return attachmentObj;
    });
}


export default sendEmail;
