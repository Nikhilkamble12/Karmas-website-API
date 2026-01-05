import cron from 'node-cron';
import db from '../../services/index.js';
import sendEmail from './comman.email.function.js';
import { QueryTypes } from 'sequelize';
import { STATUS_MASTER } from '../constants/id_constant/id.constants.js';

async function sendDailyNgoReports() {
    try {
        console.log('Fetching daily NGO requests...');

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

            // Fallback for email
            if (!recipientEmail) {
                const [ngoData] = await db.sequelize.query(
                    'SELECT email FROM ngo_master WHERE ngo_id = ? LIMIT 1',
                    { replacements: [ngoId], type: QueryTypes.SELECT }
                );
                recipientEmail = ngoData?.email;
            }

            if (!recipientEmail) continue;

            // --- CALCULATIONS ---
            const totalCount = ngoRequests.length;
            const acceptedCount = ngoRequests.filter(r => r.status_id == STATUS_MASTER.REQUEST_APPROVED).length;
            const rejectedCount = ngoRequests.filter(r => r.status_id == STATUS_MASTER.REQUEST_REJECTED).length;
            const pendingCount = ngoRequests.filter(r => r.status_id == STATUS_MASTER.REQUEST_APPROVAL_PENDINNG).length;

            const acceptedWidth = totalCount > 0 ? (acceptedCount / totalCount) * 100 : 0;
            const pendingWidth = totalCount > 0 ? (pendingCount / totalCount) * 100 : 0;
            const rejectedWidth = totalCount > 0 ? (rejectedCount / totalCount) * 100 : 0;

            const tableRows = ngoRequests.map(req => {
                let statusColor = '#718096';
                if (req.status_id == STATUS_MASTER.REQUEST_APPROVED) statusColor = '#38a169';
                if (req.status_id == STATUS_MASTER.REQUEST_REJECTED) statusColor = '#e53e3e';
                if (req.status_id == STATUS_MASTER.REQUEST_APPROVAL_PENDINNG) statusColor = '#3182ce';

                return `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">#${req.RequestId}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;"><strong>${req.RequestName}</strong></td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
                        <span style="padding: 4px 10px; border-radius: 20px; background: ${statusColor}; color: #ffffff; font-size: 11px; font-weight: bold;">
                            ${req.status_name}
                        </span>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">${req.Reason || 'N/A'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">${new Date(req.AssignedDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>`;
            }).join('');

            const htmlBody = `
            <div style="background-color: #f0f4f8; padding: 30px 10px; font-family: 'Segoe UI', Arial, sans-serif;">
                <div style="max-width: 800px; margin: auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    
                    <div style="background: #2d3748; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 22px; text-transform: uppercase;">NGO Activity Report</h1>
                           <h2 style="color:#FFFFFF; margin:0; padding:8px 0; font-size:18px; text-transform:uppercase; letter-spacing:2px;"> New Requests Assigned </h2>
                        <p style="color: #a0aec0; margin: 5px 0 0 0;">Summary for ${ngoName}</p>
                    </div>

                    <div style="padding: 25px; text-align: center; background-color: #ffffff;">
                        <div style="margin-bottom: 10px;">
                            <div style="display: inline-block; width: 45%; margin: 5px; padding: 15px; background: #ebf8ff; border-radius: 12px; border-bottom: 4px solid #3182ce;">
                                <span style="display: block; font-size: 24px; font-weight: bold; color: #2b6cb0;">${totalCount}</span>
                                <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 700;">Total Requests</span>
                            </div>
                            <div style="display: inline-block; width: 45%; margin: 5px; padding: 15px; background: #fffaf0; border-radius: 12px; border-bottom: 4px solid #dd6b20;">
                                <span style="display: block; font-size: 24px; font-weight: bold; color: #c05621;">${pendingCount}</span>
                                <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 700;">Approval Pending</span>
                            </div>
                        </div>

                        <div>
                            <div style="display: inline-block; width: 45%; margin: 5px; padding: 15px; background: #eefaf0; border-radius: 12px; border-bottom: 4px solid #38a169;">
                                <span style="display: block; font-size: 24px; font-weight: bold; color: #2f855a;">${acceptedCount}</span>
                                <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 700;">Accepted</span>
                            </div>
                            <div style="display: inline-block; width: 45%; margin: 5px; padding: 15px; background: #fff5f5; border-radius: 12px; border-bottom: 4px solid #e53e3e;">
                                <span style="display: block; font-size: 24px; font-weight: bold; color: #c53030;">${rejectedCount}</span>
                                <span style="font-size: 11px; color: #4a5568; text-transform: uppercase; font-weight: 700;">Rejected</span>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 0 35px 25px 35px;">
                        <div style="width: 100%; height: 12px; background-color: #edf2f7; border-radius: 10px; overflow: hidden; display: flex;">
                            <div style="width: ${acceptedWidth}%; background-color: #38a169;"></div>
                            <div style="width: ${pendingWidth}%; background-color: #dd6b20;"></div>
                            <div style="width: ${rejectedWidth}%; background-color: #e53e3e;"></div>
                        </div>
                    </div>

                    <div style="padding: 0 35px 35px 35px;">
                        <div style="width: 100%; overflow-x: auto; border: 1px solid #e2e8f0; border-radius: 10px;">
                            <table style="width: 100%; min-width: 600px; border-collapse: collapse; text-align: left;">
                                <thead>
                                    <tr style="background-color: #f7fafc;">
                                        <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; border-bottom: 2px solid #e2e8f0;">ID</th>
                                        <th style="padding: 15px 12px; font-size: 11px; color: #4a5568; border-bottom: 2px solid #e2e8f0;">NAME</th>
                                        <th style="padding: 12px; font-size: 11px; color: #4a5568; border-bottom: 2px solid #e2e8f0;">STATUS</th>
                                        <th style="padding: 12px; font-size: 11px; color: #4a5568; border-bottom: 2px solid #e2e8f0;">REMARKS</th>
                                        <th style="padding: 12px; font-size: 11px; color: #4a5568; border-bottom: 2px solid #e2e8f0;">TIME</th>
                                    </tr>
                                </thead>
                                <tbody>${tableRows}</tbody>
                            </table>
                        </div>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://yourportal.com" style="display: inline-block; padding: 12px 30px; background-color: #3182ce; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Login to Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>`;

            await sendEmail({
                to: recipientEmail,
                subject: `Daily Request Summary - ${ngoName}`,
                html: htmlBody
            });
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