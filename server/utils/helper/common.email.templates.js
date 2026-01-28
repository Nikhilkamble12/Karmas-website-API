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
          <!DOCTYPE html>
          <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Password Reset Code | Karmas</title>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@700&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; width: 100%; background-color: #f0f7f8; }
              .main-bg { background: linear-gradient(145deg, #e6f2f3 0%, #f0f7f8 100%); }
              .glass-card { background-color: #ffffff; border-radius: 48px; box-shadow: 0 30px 60px -12px rgba(0, 71, 97, 0.12); }
              .accent-bar { background: linear-gradient(90deg, #004761 0%, #35C2C1 100%); height: 8px; border-radius: 48px 48px 0 0; }
              @media screen and (max-width: 600px) { .sm-w-full { width: 100% !important; } .sm-p { padding: 30px !important; } .sm-text-4xl { font-size: 32px !important; } }
            </style>
          </head>
          <body class="main-bg">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 50px 10px;">
              <tr>
                <td align="center">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" class="sm-w-full">
                    
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <img src="https://ac02fb06-1050-422f-92bd-86fef3f2ec41.b-cdn.net/e/2a23e72c-ee16-47f5-b7b2-eb97439d995f/26f66e0d-5d40-4720-8d1b-ac9b1e3d7f32.png" width="130" alt="Karmas" style="display: block; border: 0;">
                      </td>
                    </tr>

                    <tr>
                      <td class="glass-card sm-p" style="padding: 60px; position: relative;">
                        <div class="accent-bar"></div>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px;">
                          <tr>
                            <td>
                              <h1 class="sm-text-4xl" style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 800; color: #004761; line-height: 1.1; letter-spacing: -1px;">
                                Password Reset <span style="color: #35C2C1;">Code.</span>
                              </h1>
                              <p style="margin: 25px 0 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; line-height: 28px; color: #506a73;">
                                Hi <strong>${username}</strong>, <br>
                                You requested to reset your password. Use the verification code below to proceed with the update:
                              </p>
                            </td>
                          </tr>

                          <tr>
                            <td align="center" style="padding: 45px 0;">
                              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fcfc; border-radius: 30px; border-left: 8px solid #35C2C1; border-right: 1px solid #d1eaea; border-top: 1px solid #d1eaea; border-bottom: 1px solid #d1eaea;">
                                <tr>
                                  <td align="center" style="padding: 50px 20px;">
                                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 64px; font-weight: 800; color: #004761; letter-spacing: 15px; margin-left: 15px;">
                                      ${otp}
                                    </div>
                                    <div style="margin-top: 15px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700; color: #35C2C1; text-transform: uppercase; letter-spacing: 3px;">
                                      Valid for ${validity}
                                    </div>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding: 25px; background-color: #f0f4f5; border-radius: 20px;">
                              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                  <td style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #6e8891; line-height: 20px;">
                                    🛡️ <strong>Security Notice:</strong> If you did not request this, you can safely ignore this email. No changes will be made to your account.
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>

                          <tr>
                            <td style="padding-top: 40px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: #506a73;">
                              Best regards,<br>
                              <strong style="color: #004761;">Karmas Team</strong>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding-top: 50px;">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding-bottom: 25px;">
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">Instagram</a>
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">LinkedIn</a>
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">Support Center</a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #94b1b8; line-height: 22px;">
                                &copy; 2026 KARMAS. All Rights Reserved.<br>
                                Sent securely from Mumbai, India to ${userEmail}.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
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
          <!DOCTYPE html>
          <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Password Reset Successful | Karmas</title>
            
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Plus+Jakarta+Sans:wght@400;700&display=swap" rel="stylesheet">

            <style>
              /* Base Reset Styles */
              body { margin: 0; padding: 0; width: 100%; background-color: #f0f7f8; -webkit-font-smoothing: antialiased; }
              table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
              img { border: 0; line-height: 100%; outline: none; text-decoration: none; display: block; }
              
              /* Layout Design Styles */
              .main-bg { background: linear-gradient(145deg, #e6f2f3 0%, #f0f7f8 100%); }
              .glass-card { background-color: #ffffff; border-radius: 48px; box-shadow: 0 30px 60px -12px rgba(0, 71, 97, 0.12); overflow: hidden; }
              .accent-bar { background: linear-gradient(90deg, #004761 0%, #35C2C1 100%); height: 8px; border-radius: 48px 48px 0 0; }
              
              /* Responsive Adjustments */
              @media screen and (max-width: 600px) {
                .sm-w-full { width: 100% !important; }
                .sm-p { padding: 40px 30px !important; }
                .sm-text-4xl { font-size: 32px !important; }
              }
            </style>
          </head>
          <body class="main-bg">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 50px 10px;">
              <tr>
                <td align="center">
                  <table width="600" border="0" cellspacing="0" cellpadding="0" class="sm-w-full">
                    
                    <tr>
                      <td align="center" style="padding-bottom: 40px;">
                        <img src="https://ac02fb06-1050-422f-92bd-86fef3f2ec41.b-cdn.net/e/2a23e72c-ee16-47f5-b7b2-eb97439d995f/26f66e0d-5d40-4720-8d1b-ac9b1e3d7f32.png" width="130" alt="Karmas Logo" style="display: block;">
                      </td>
                    </tr>

                    <tr>
                      <td class="glass-card">
                        <div class="accent-bar"></div>
                        
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td class="sm-p" style="padding: 60px;">
                              
                              <h1 class="sm-text-4xl" style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 800; color: #004761; line-height: 1.1; letter-spacing: -1px;">
                                Password Reset <span style="color: #35C2C1;">Successful.</span>
                              </h1>
                              
                              <div style="margin: 25px 0 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 16px; line-height: 28px; color: #506a73;">
                                <p style="margin: 0 0 15px;">Hi <strong>${username}</strong>,</p>
                                <p style="margin: 0;">Your password has been successfully updated. You can now use your new credentials to access your account securely.</p>
                              </div>

                              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 35px; background-color: #f0f4f5; border-radius: 20px;">
                                <tr>
                                  <td style="padding: 25px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; color: #6e8891; line-height: 20px;">
                                    🛡️ <strong>Security Check:</strong> If you did not make this change, please contact our support team immediately to protect your account. No further action is required if this was you.
                                  </td>
                                </tr>
                              </table>

                              <div style="padding-top: 40px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 15px; color: #506a73;">
                                Best regards,<br>
                                <strong style="color: #004761;">Karmas Team</strong>
                              </div>

                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td align="center" style="padding-top: 50px;">
                        <table border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="padding-bottom: 25px;">
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">Instagram</a>
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">LinkedIn</a>
                              <a href="#" style="color: #35C2C1; text-decoration: none; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; margin: 0 15px;">Support Center</a>
                            </td>
                          </tr>
                          <tr>
                            <td align="center">
                              <p style="margin: 0; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #94b1b8; line-height: 22px;">
                                &copy; 2026 KARMAS. All Rights Reserved.<br>
                                Sent securely from Mumbai, India.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `;
      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
  EmailVerificationRequestSent: async ({
    email_id,
    otp,
    username = "User",
    validity = "20 min",
  }) => {
    try {
      const subject = `Action Required: Verify your email`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Email</title>
          </head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;color:#333333;">
          
          <div style="display:none;font-size:1px;color:#f9fafb;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
            Use code ${otp} to verify your Karmas account.
          </div>

          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background-color:#f9fafb;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                
                <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,0.08);overflow:hidden;border:1px solid #f0f0f0;">
                  
                  <div style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);padding:40px 30px;text-align:center;">
                    <div style="margin-bottom:15px;">
                      <span style="font-size:42px;background:#ffffff;border-radius:50%;padding:12px 18px;color:#059669;box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                        &#128274; </span>
                    </div>
                    <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">Verify your email</h1>
                    <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Secure your Karmas account</p>
                  </div>

                  <div style="padding:40px 30px;text-align:center;">
                    <p style="margin:0 0 24px 0;color:#374151;font-size:16px;line-height:1.6;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin:0 0 32px 0;color:#4b5563;font-size:16px;line-height:1.6;">
                      Thanks for joining <strong>Karmas</strong>! We just need to verify your email address to complete your registration.
                    </p>

                    <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin-bottom:32px;display:inline-block;min-width:200px;">
                      <p style="margin:0 0 8px 0;color:#166534;font-size:12px;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Verification Code</p>
                      <span style="font-family:'Courier New', Courier, monospace;font-size:36px;font-weight:700;letter-spacing:6px;color:#15803d;display:block;">${otp}</span>
                    </div>

                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.5;">
                      This code will expire in <strong>${validity}</strong>.<br>
                      If you didn't attempt to sign up, you can safely ignore this email.
                    </p>
                  </div>

                  <div style="background-color:#f8fafc;padding:24px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0 0 8px 0;color:#9ca3af;font-size:12px;">Need help? <a href="#" style="color:#10b981;text-decoration:none;">Contact Support</a></p>
                    <p style="margin:0;color:#cbd5e1;font-size:12px;">&copy; ${new Date().getFullYear()} Karmas Team.</p>
                  </div>
                </div>
                
                <div style="height:40px;"></div>
                
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
  EmailVefiicationCompletedSuccessFully: async ({
    email_id,
    username = "Friend",
  }) => {
    try {
      const subject = `Welcome home, ${username}! 🌱`;

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Karmas</title>
          </head>
        <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;color:#333333;">
          
          <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background-color:#f8fafc;">
            <tr>
              <td align="center" style="padding:40px 20px;">
                
                <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.08);overflow:hidden;border:1px solid #f1f5f9;">
                  
                  <div style="background-color:#ffffff;padding:40px 30px 20px;text-align:center;">
                    <div style="margin-bottom:20px;">
                        <span style="font-size:50px;line-height:1;">✨</span>
                    </div>
                    <h1 style="margin:0 0 10px;color:#10b981;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Welcome to the Family!</h1>
                    <p style="margin:0;color:#64748b;font-size:16px;font-weight:500;">Verification Complete</p>
                  </div>

                  <div style="padding:0 40px;text-align:center;">
                    <p style="margin:0 0 24px;color:#334155;font-size:16px;line-height:1.6;">
                      Hi <strong>${username}</strong>,
                    </p>
                    <p style="margin:0 0 30px;color:#475569;font-size:16px;line-height:1.6;">
                      We are thrilled to have you here. <strong>Karmas</strong> isn't just an app; it's a movement where kindness connects us. You are now part of a global community dedicated to making a difference.
                    </p>
                  </div>

                  <div style="padding:0 30px 20px;">
                    <p style="text-align:center;color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:25px;">Your Journey Begins Here</p>
                    
                    <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
                      <tr>
                        <td width="50" valign="top">
                           <div style="background-color:#eff6ff;width:40px;height:40px;border-radius:10px;text-align:center;line-height:40px;">
                             <span style="font-size:20px;">🔍</span>
                           </div>
                        </td>
                        <td style="padding-left:15px;">
                          <strong style="color:#1e293b;font-size:16px;display:block;margin-bottom:4px;">Discover & Connect</strong>
                          <span style="color:#64748b;font-size:14px;line-height:1.5;">Find friends, passionate volunteers, and verified NGOs near you. Build your network of goodness.</span>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:25px;">
                      <tr>
                        <td width="50" valign="top">
                           <div style="background-color:#fdf4ff;width:40px;height:40px;border-radius:10px;text-align:center;line-height:40px;">
                             <span style="font-size:20px;">💬</span>
                           </div>
                        </td>
                        <td style="padding-left:15px;">
                          <strong style="color:#1e293b;font-size:16px;display:block;margin-bottom:4px;">Engage with Purpose</strong>
                          <span style="color:#64748b;font-size:14px;line-height:1.5;">Post questions, share your stories, and interact deeply with a community that cares.</span>
                        </td>
                      </tr>
                    </table>

                     <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);border-radius:16px;padding:25px;margin-top:10px;border:1px solid #a7f3d0;">
                      <table role="presentation" style="width:100%;border-collapse:collapse;">
                        <tr>
                          <td width="50" valign="top">
                             <div style="background-color:#ffffff;width:40px;height:40px;border-radius:50%;text-align:center;line-height:40px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                               <span style="font-size:20px;">🏆</span>
                             </div>
                          </td>
                          <td style="padding-left:15px;">
                            <strong style="color:#065f46;font-size:16px;display:block;margin-bottom:4px;">Complete Milestones</strong>
                            <span style="color:#047857;font-size:14px;line-height:1.5;">Every good deed counts. Track your impact, unlock levels, and earn amazing rewards as you grow.</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                  </div>

                  <div style="padding:20px 30px 40px;text-align:center;">
                    <a href="https://yourwebsite.com/dashboard" style="display:inline-block;padding:18px 40px;background-color:#10b981;color:#ffffff;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px;box-shadow:0 10px 20px rgba(16, 185, 129, 0.25);transition:all 0.3s ease;">
                      Start Your Impact Journey
                    </a>
                  </div>

                  <div style="background-color:#f8fafc;padding:30px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0 0 10px;color:#94a3b8;font-size:13px;font-style:italic;">"Small acts, when multiplied by millions of people, can transform the world."</p>
                    <p style="margin:0;color:#cbd5e1;font-size:12px;">&copy; ${new Date().getFullYear()} Karmas Team.</p>
                  </div>
                </div>
                
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
  NgoRegistrationApprovedSuccessfully: async ({
    email_id,
    username = "Friend",
    password,
  }) => {
    try {
      const subject = `Your NGO Registration is Approved! 🌟`;

      const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>NGO Registration Approved</title>
    </head>

    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#333;">
      <table role="presentation" width="100%" style="border-collapse:collapse;background:#f8fafc;">
        <tr>
          <td align="center" style="padding:40px 20px;">
            
            <div style="max-width:600px;background:#fff;border-radius:20px;border:1px solid #f1f5f9;box-shadow:0 20px 40px rgba(0,0,0,0.08);overflow:hidden;">

              <div style="padding:40px 30px 20px;text-align:center;">
                <div style="font-size:50px;margin-bottom:20px;">🎉</div>
                <h1 style="margin:0;color:#10b981;font-size:28px;font-weight:800;">Registration Approved</h1>
                <p style="margin:5px 0 0;color:#64748b;font-size:16px;">Your NGO is now verified</p>
              </div>

              <div style="padding:0 40px;text-align:center;">
                <p style="color:#334155;font-size:16px;line-height:1.6;">
                  Dear <strong>${username}</strong>,
                </p>
                <p style="margin:0 0 25px;color:#475569;font-size:16px;line-height:1.6;">
                  Congratulations! Your NGO registration has been successfully reviewed and approved.  
                  You now have access to all features including volunteer management, posts, and milestone tracking.
                </p>
              </div>
              <p style="margin:0 0 30px;color:#475569;font-size:16px;line-height:1.6;">
                Your account has been successfully created. Below are your login credentials:
              </p>

              <div style="background:#f1f5f9;padding:15px;border-radius:10px;margin-bottom:25px;text-align:center;">
                <p style="margin:0;color:#1e293b;font-size:15px;font-weight:600;">
                  <strong>Email:</strong> ${email_id}<br>
                  <strong>Password:</strong> ${password}
                </p>
              </div>


              <div style="padding:20px 30px 40px;text-align:center;">
                <a href="https://yourwebsite.com/ngo-dashboard"
                   style="display:inline-block;padding:16px 40px;background-color:#10b981;color:#fff;text-decoration:none;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 10px 20px rgba(16,185,129,0.25);">
                  Go to Your NGO Dashboard
                </a>
              </div>

              <div style="background:#f8fafc;padding:25px;text-align:center;border-top:1px solid #f1f5f9;">
                <p style="margin:0;color:#94a3b8;font-size:13px;">
                  Thank you for choosing Karmas to amplify your impact.
                </p>
                <p style="margin:5px 0 0;color:#cbd5e1;font-size:12px;">© ${new Date().getFullYear()} Karmas Team.</p>
              </div>

            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
  NgoRegistrationRejected: async ({
    email_id,
    username = "Friend",
    reason = "Your submission did not meet the required criteria.",
  }) => {
    try {
      const subject = `NGO Registration Review Result – Action Needed ❗`;

      const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Registration Rejected</title>
    </head>

    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <table width="100%" style="border-collapse:collapse;background:#f8fafc;">
        <tr>
          <td align="center" style="padding:40px 20px;">

            <div style="max-width:600px;background:#ffffff;border-radius:20px;box-shadow:0 20px 40px rgba(0,0,0,0.08);border:1px solid #f1f5f9;overflow:hidden;">

              <div style="padding:40px 30px 20px;text-align:center;">
                <div style="font-size:50px;margin-bottom:15px;">⚠️</div>
                <h1 style="margin:0;color:#dc2626;font-size:26px;font-weight:800;">Registration Review Failed</h1>
                <p style="color:#64748b;font-size:15px;margin-top:5px;">We need additional corrections</p>
              </div>

              <div style="padding:0 40px;text-align:center;">
                <p style="color:#334155;font-size:16px;">Hello <strong>${username}</strong>,</p>
                <p style="color:#475569;font-size:16px;line-height:1.6;margin-bottom:25px;">
                  Unfortunately, your NGO registration could not be approved at this time.
                </p>

                <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <strong style="color:#b91c1c;font-size:16px;">Reason:</strong>
                  <p style="color:#7f1d1d;font-size:15px;margin:10px 0 0;">${reason}</p>
                </div>
              </div>

              <div style="padding:20px 30px 40px;text-align:center;">
                <a href="https://yourwebsite.com/support"
                   style="display:inline-block;padding:14px 35px;background:#dc2626;color:#ffffff;border-radius:50px;font-size:15px;font-weight:700;text-decoration:none;box-shadow:0 8px 15px rgba(220,38,38,0.25);">
                  Contact Support
                </a>
              </div>

              <div style="background:#f8fafc;text-align:center;padding:25px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;color:#94a3b8;font-size:13px;font-style:italic;">
                  We are here to help you complete your registration.
                </p>
                <p style="margin-top:5px;color:#cbd5e1;font-size:12px;">© ${new Date().getFullYear()} Karmas Team.</p>
              </div>

            </div>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
  NgoRegistrationResubmitRequired: async ({
    email_id,
    username = "Friend",
    reason = "Some documents were missing or unclear.",
  }) => {
    try {
      const subject = `NGO Registration Requires Re-Submission 🔄`;

      const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Resubmission Needed</title>
    </head>

    <body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <table width="100%" style="border-collapse:collapse;background:#f8fafc;">
        <tr>
          <td align="center" style="padding:40px 20px;">

            <div style="max-width:600px;background:#fff;border-radius:20px;border:1px solid #f1f5f9;box-shadow:0 20px 40px rgba(0,0,0,0.08);overflow:hidden;">

              <div style="padding:40px 30px 20px;text-align:center;">
                <div style="font-size:50px;margin-bottom:20px;">🔄</div>
                <h1 style="margin:0;color:#0ea5e9;font-size:28px;font-weight:800;">Resubmission Needed</h1>
                <p style="margin:5px 0 0;color:#64748b;font-size:15px;">Some corrections are required</p>
              </div>

              <div style="padding:0 40px;text-align:center;">
                <p style="color:#334155;font-size:16px;">Hi <strong>${username}</strong>,</p>
                <p style="color:#475569;font-size:16px;line-height:1.6;margin-bottom:25px;">
                  Your NGO registration was reviewed, but we need additional details to proceed.
                </p>

                <div style="background:#eff6ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:30px;">
                  <strong style="color:#0369a1;font-size:16px;">Required Fixes:</strong>
                  <p style="color:#075985;font-size:15px;margin-top:10px;">${reason}</p>
                </div>
              </div>

              <div style="padding:20px 30px 40px;text-align:center;">
                <a href="https://yourwebsite.com/resubmit"
                   style="display:inline-block;padding:16px 40px;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 10px 20px rgba(14,165,233,0.25);">
                  Resubmit Registration
                </a>
              </div>

              <div style="background:#f8fafc;padding:25px;text-align:center;border-top:1px solid #f1f5f9;">
                <p style="margin:0;color:#94a3b8;font-size:13px;">We appreciate your quick response.</p>
                <p style="margin-top:5px;color:#cbd5e1;font-size:12px;">© ${new Date().getFullYear()} Karmas Team.</p>
              </div>

            </div>

          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

      return { subject, html };
    } catch (error) {
      throw error;
    }
  },
};

export default CommonEmailtemplate;
