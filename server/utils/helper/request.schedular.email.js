import cron from 'node-cron';
import db from '../../services/index.js';
import sendEmail from './comman.email.function.js';
import { QueryTypes } from 'sequelize';

async function sendDailyNgoReports() {
    try {
        console.log('Fetching daily NGO requests...');

        // 1. Fetch requests from the last 24 hours
        const requests = await db.sequelize.query(
            `SELECT * FROM v_Request_Ngo 
             WHERE AssignedDate >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
            { type: QueryTypes.SELECT }
        );

        if (!requests || requests.length === 0) {
            console.log('No requests assigned in the last 24 hours.');
            return;
        }

        const ngoGroups = requests.reduce((acc, req) => {
            if (!acc[req.ngo_id]) acc[req.ngo_id] = [];
            acc[req.ngo_id].push(req);
            return acc;
        }, {});

        for (const ngoId in ngoGroups) {
            const ngoRequests = ngoGroups[ngoId];
            const ngoName = ngoRequests[0].ngo_name;
            let recipientEmail = ngoRequests[0].email;

            if (!recipientEmail) {
                const [ngoData] = await db.sequelize.query(
                    'SELECT email FROM ngo_master WHERE ngo_id = ? LIMIT 1',
                    { replacements: [ngoId], type: QueryTypes.SELECT }
                );
                recipientEmail = ngoData?.email;
            }

            if (!recipientEmail) {
                console.warn(`No email found for NGO: ${ngoName}`);
                continue;
            }

            // --- FIXED CALCULATIONS ---
            const total = ngoRequests.length;
            const approvedCount = ngoRequests.filter(r => r.status_id == 7 || r.status_name.toLowerCase().includes('approved')).length;
            const rejectedCount = ngoRequests.filter(r => r.status_id == 8 || r.status_name.toLowerCase().includes('rejected')).length;
            const assignedCount = ngoRequests.filter(r => r.status_id == 6 || r.status_name.toLowerCase().includes('assigned')).length;

            // Calculate Progress Bar Widths
            const approvedWidth = total > 0 ? (approvedCount / total) * 100 : 0;
            const assignedWidth = total > 0 ? (assignedCount / total) * 100 : 0;
            const rejectedWidth = total > 0 ? (rejectedCount / total) * 100 : 0;

            // Generate Table Rows
            const tableRows = ngoRequests.map(req => {
                // Color coding status labels
                let statusColor = '#718096'; // Default Gray
                if (req.status_id == 7) statusColor = '#38a169'; // Green
                if (req.status_id == 8) statusColor = '#e53e3e'; // Red
                if (req.status_id == 6) statusColor = '#3182ce'; // Blue

                return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #4a5568;">#${req.RequestId}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #2d3748;"><strong>${req.RequestName}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
                        <span style="padding: 4px 10px; border-radius: 20px; background: ${statusColor}; color: #ffffff; font-size: 11px; font-weight: bold; text-transform: uppercase;">
                            ${req.status_name}
                        </span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #718096; font-size: 13px;">${req.Reason || 'No remarks'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee; color: #718096; font-size: 12px;">${new Date(req.AssignedDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>`;
            }).join('');

            const htmlBody = `
        <div style="background-color: #f0f4f8; padding: 30px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
            <div style="max-width: 800px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                
                <div style="background: #2d3748; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">NGO Activity Report</h1>
                    <p style="color: #a0aec0; margin: 5px 0 0 0; font-size: 14px;">Summary for ${ngoName}</p>
                </div>

                <div style="padding: 25px; text-align: center; background-color: #ffffff;">
                    <div style="display: inline-block; width: 28%; margin: 5px; padding: 15px; background: #ebf8ff; border-radius: 12px; border-bottom: 4px solid #3182ce;">
                        <span style="display: block; font-size: 22px; font-weight: bold; color: #2b6cb0;">${total}</span>
                        <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 600;">Total</span>
                    </div>
                    <div style="display: inline-block; width: 28%; margin: 5px; padding: 15px; background: #f0fff4; border-radius: 12px; border-bottom: 4px solid #38a169;">
                        <span style="display: block; font-size: 22px; font-weight: bold; color: #2f855a;">${approvedCount}</span>
                        <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 600;">Approved</span>
                    </div>
                    <div style="display: inline-block; width: 28%; margin: 5px; padding: 15px; background: #fff5f5; border-radius: 12px; border-bottom: 4px solid #e53e3e;">
                        <span style="display: block; font-size: 22px; font-weight: bold; color: #c53030;">${rejectedCount}</span>
                        <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 600;">Rejected</span>
                    </div>
                </div>

                <div style="padding: 0 35px 25px 35px;">
                    <p style="font-size: 12px; color: #718096; margin-bottom: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Status Distribution</p>
                    <div style="width: 100%; height: 14px; background-color: #edf2f7; border-radius: 10px; overflow: hidden; display: flex;">
                        <div style="width: ${approvedWidth}%; background-color: #38a169; height: 100%;"></div>
                        <div style="width: ${assignedWidth}%; background-color: #3182ce; height: 100%;"></div>
                        <div style="width: ${rejectedWidth}%; background-color: #e53e3e; height: 100%;"></div>
                    </div>
                    <div style="margin-top: 10px; font-size: 11px;">
                        <span style="color: #38a169; margin-right: 15px;">● Approved (${Math.round(approvedWidth)}%)</span>
                        <span style="color: #3182ce; margin-right: 15px;">● Assigned (${Math.round(assignedWidth)}%)</span>
                        <span style="color: #e53e3e;">● Rejected (${Math.round(rejectedWidth)}%)</span>
                    </div>
                </div>

                <div style="padding: 0 35px 35px 35px;">
                    <div style="width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;">
                        <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: left;">
                            <thead>
                                <tr style="background-color: #f7fafc;">
                                    <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">ID</th>
                                    <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Request Name</th>
                                    <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Status</th>
                                    <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Remarks</th>
                                    <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://yourportal.com" style="display: inline-block; padding: 12px 30px; background-color: #3182ce; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Login to Portal for Live Updates</a>
                    </div>

                    <div style="margin-top: 30px; padding: 15px; background-color: #fffaf0; border-radius: 8px; border: 1px solid #feebc8;">
                        <p style="margin: 0; font-size: 13px; color: #7b341e; line-height: 1.5;">
                            <strong>Note:</strong> This report was generated at 5:00 AM IST. Data reflects requests processed in the last 24 hours. Always check the portal for real-time status sync.
                        </p>
                    </div>
                </div>

                <div style="background-color: #f7fafc; padding: 20px; text-align: center; font-size: 11px; color: #a0aec0; border-top: 1px solid #e2e8f0;">
                    Sent by NGO Automated System | Generated on ${new Date().toLocaleDateString('en-IN')}
                </div>
            </div>
        </div>`
        ;

            await sendEmail({
                to: recipientEmail,
                subject: `Daily Request Summary - ${ngoName}`,
                html: htmlBody
            });

            console.log(`Successfully sent daily report to ${ngoName}`);
        }

    } catch (error) {
        console.error('CRITICAL: Scheduler Failed', error);
    }
}

// Final Scheduler for 5:00 AM IST
const initScheduler = () => {
    cron.schedule('0 5 * * *', () => {
        console.log('⏰ Running Daily NGO Report at 05:00 IST...');
        sendDailyNgoReports();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
    console.log('✅ NGO Email Scheduler registered for 05:00 IST');
};

export default initScheduler;