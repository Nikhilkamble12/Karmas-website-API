const emailFooter = `
  <div style="background-color:#f9f9f9;text-align:center;padding:15px;font-size:13px;color:#777;">
    &copy; ${new Date().getFullYear()} Your Company. All rights reserved.<br>
    Need help? <a href="mailto:support@yourcompany.com" style="color:#1d4ed8;">Contact Support</a>
  </div>
`;



const CommonEmailtemplate = {
    PasswordResetMail: async ({ username, otp, validity = "20 minutes" }) => {
      try {
        const subject = `Reset Your Password - OTP Inside`;
        const html = `
          <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.05);font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background-color:#1d4ed8;color:#fff;padding:20px;text-align:center;">
              <h2>Password Reset Code</h2>
            </div>
            <div style="padding:30px;">
              <p>Hi <strong>${username}</strong>,</p>
              <p>You requested to reset your password. Use the code below to proceed:</p>
              <div style="background:#f0f6ff;border-left:6px solid #1d4ed8;padding:15px;font-size:22px;font-weight:bold;text-align:center;color:#1d4ed8;margin:25px 0;">${otp}</div>
              <p>This code will expire in <strong>${validity}</strong>.</p>
              <p>If you didn’t request this, you can safely ignore this email.</p>
              <p>Best regards,<br><strong>Karmas Team</strong></p>
            </div>
            ${emailFooter}
          </div>
        `;
        return { subject, html };
      } catch (error) {
        throw error;
      }
    },
  
    PasswordHasBeenUpdatedSuccessfully: async ({ username }) => {
      try {
        const subject = `Your Password Was Successfully Reset`;
        const html = `
          <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:8px;box-shadow:0 4px 10px rgba(0,0,0,0.05);font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="background-color:#10b981;color:#fff;padding:20px;text-align:center;">
              <h2>Password Reset Successful</h2>
            </div>
            <div style="padding:30px;">
              <p>Hello <strong>${username}</strong>,</p>
              <p>Your password has been successfully updated. If this wasn’t you, please contact our support team immediately.</p>
              <p>Best regards,<br><strong>Karmas Team</strong></p>
            </div>
            ${emailFooter}
          </div>
        `;
        return { subject, html };
      } catch (error) {
        throw error;
      }
    }
  };
  
export default CommonEmailtemplate;
  