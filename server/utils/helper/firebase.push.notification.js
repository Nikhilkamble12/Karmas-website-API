// import admin from 'firebase-admin';
// import serviceAccount from "../../middleware/external_documents/firebase/karmas.firebase.json" assert { type: 'json' };
// import NotificationHistoryDAL from '../../services/notification_history/notification.history.data.layer.js';
// import notificationTemplates from './notification.templates.js';
// import UserTokenService from '../../services/user_tokens/user.tokens.service.js';

// // if (!admin.apps.length) {
// //   admin.initializeApp({
// //     credential: admin.credential.cert(serviceAccount)
// //   });
// // }

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// console.log("messaging().sendAll:", typeof admin.messaging().sendAll);


// const getMetaValue = (metaData, key) => {
//   return metaData && Object.prototype.hasOwnProperty.call(metaData, key)
//     ? metaData[key]
//     : null;
// };

// const sendTemplateNotification = async ({
//   templateKey,
//   templateData,
//   userIds,
//   metaData = {}
// }) => {
//   try {
//     if (admin.apps.length > 0) {
//       console.log("✅ Firebase is initialized.");
//     } else {
//       console.log("❌ Firebase is NOT initialized.");
//     }

//     console.log("admin.messaging type:", typeof admin.messaging);
//     console.log("admin.messaging() type:", typeof admin.messaging());
//     console.log("admin.messaging().sendAll:", admin.messaging().sendAll);

//     // 1. Build message from template
//     // const templateFn = notificationTemplates[templateKey];
//     // if (!templateFn) throw new Error(`Template ${templateKey} not found`);

//     const { title, description } = templateData;
//     // console.log("userIds",userIds)
//     // 2. Fetch user tokens
//     // const tokens = await UserTokenService.GetTokensByUserIds(userIds);

//     // if (tokens.length === 0) {
//     //   console.log("No active tokens found for given user(s).");
//     //   return;
//     // }

//     // 3. Prepare Firebase messages
//     const messages = userIds.map(({ token }) => ({
//       token,
//       notification: {
//         title,
//         body: description
//       },
//       data: {
//         type: templateKey
//         // you can add metadata here if needed
//       }
//     }));

//     // 4. Send in batch (Firebase supports up to 500 at once)
//     // const response = await admin.messaging().sendAll(messages);
//     console.log("messages", messages)
//     const responses = await Promise.allSettled(
//       messages.map(message => admin.messaging().send(message))
//     );
//     console.log("responses", responses)
//     const successCount = responses.filter(r => r.status === 'fulfilled').length;
//     const failureCount = responses.filter(r => r.status === 'rejected').length;

//     console.log(`Sent success count ${successCount} failure count ${failureCount} notifications successfully.`);
//     const notificationRows = await userIds.map(tokenObj => ({
//       token_id: tokenObj.token,
//       user_id: tokenObj.user_id ?? null,
//       ngo_id: getMetaValue(metaData, 'ngo_id'),
//       request_id: getMetaValue(metaData, 'request_id'),
//       post_id: getMetaValue(metaData, 'post_id'),
//       notification_title: title,
//       notification_details: description,
//       notification_type: templateKey,
//       is_viewed: 0,
//       is_active: 1,
//       created_by: getMetaValue(metaData, 'created_by'),
//       created_at: new Date(),
//     }));

//     // Call your bulk create function (assumed implemented)
//     await NotificationHistoryDAL.CreateBulkData(notificationRows);

//     return responses;
//   } catch (error) {
//     console.error("Failed to send push notifications:", error);
//     throw error;
//   }
// };

// export default sendTemplateNotification


import admin from 'firebase-admin';

import fs from "fs"
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// In ES Modules, __dirname is not available directly, so we construct it
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// import serviceAccount from "../../middleware/external_documents/firebase/karmas.firebase.json" assert { type: 'json' };
import NotificationHistoryDAL from '../../services/notification_history/notification.history.data.layer.js';
// import notificationTemplates from './notification.templates.js'; // Assuming this is not used for title/description directly
// import UserTokenService from '../../services/user_tokens/user.tokens.service.js'; // Assuming userIds already contain tokens
// Read the JSON file synchronously
// const SERVICE_ACCOUNT_PATH = '../../middleware/external_documents/firebase/karmas.firebase.json';
const serviceAccountPath = path.resolve(__dirname, '../../middleware/external_documents/firebase/karmas.firebase.json');

const serviceAccountRaw = fs.readFileSync(serviceAccountPath, 'utf-8');
const serviceAccount = JSON.parse(serviceAccountRaw);
// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
import { getMessaging } from 'firebase-admin/messaging';
const messaging = getMessaging();


// Helper to safely get nested values from metadata
const getMetaValue = (metaData, key) => {
    return metaData && Object.prototype.hasOwnProperty.call(metaData, key)
        ? metaData[key]
        : null;
};

// Helper function to chunk an array into smaller arrays
const chunkArray = (array, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
};

const convertObjectValuesToString = (obj) => {
    if (!obj || typeof obj !== 'object') {
        return {}; // Return empty object or original if not an object
    }
    const newObj = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            // Convert each value to a string. Handle null/undefined as empty string.
            newObj[key] = String(obj[key] || '');
        }
    }
    return newObj;
};

const sendTemplateNotification = async ({
    templateKey,
    templateData,
    userIds, // This should be an array of objects like { token: 'fcm_token', user_id: 'user_id' }
    metaData = {}
}) => {
    try {
        if (admin.apps.length > 0) {
            console.log("✅ Firebase Admin SDK is initialized and ready.");
        } else {
            console.error("❌ Firebase Admin SDK is NOT initialized. This should not happen.");
            throw new Error("Firebase Admin SDK not initialized.");
        }

        const { title, description } = templateData;

        if (!userIds || userIds.length === 0) {
            console.log("No user IDs (with tokens) provided. Skipping notification send.");
            return {
                totalTokens: 0,
                successCount: 0,
                failureCount: 0,
                failedTokens: []
            };
        }

        // // Extract just the tokens for FCM multicast
        // const tokens = userIds.map(user => user.token);

        // const tokenBatches = chunkArray(tokens, batchSize);

        // console.log(`Sending notifications to ${tokens.length} tokens in ${tokenBatches.length} batches...`);


        // Build an array of per-user messages:
        // const messages = userIds.map(user => ({
        //     token: user.token,
        //     notification: {
        //         title,
        //         body: description,
        //         image: user.user_image || undefined // image per user
        //     },
        //     data: {
        //         user_image: user.user_image ?? '',
        //         bg_image: user.bg_image ?? '',
        //         type: templateKey,
        //         ...convertObjectValuesToString(metaData),
        //     }
        // }));


        const messages = [];
        userIds.forEach(user => {

        // send to Android if token available
        if (user.android_token) {
            messages.push({
            token: user.android_token,
            notification: {
                title,
                body: description,
                image: user.user_image || undefined,
            },
            data: {
                user_image: user.user_image ?? '',
                bg_image: user.user_bg_image ?? '',
                type: templateKey,
                ...convertObjectValuesToString(metaData),
            },
            });
        }

        // send to Web if token available
        if (user.web_token) {
            messages.push({
            token: user.web_token,
            notification: {
                title,
                body: description,
                image: user.user_image || undefined,
            },
            data: {
                user_image: user.user_image ?? '',
                bg_image: user.user_bg_image ?? '',
                type: templateKey,
                ...convertObjectValuesToString(metaData),
            },
            });
        }
        });


        // Break into batches of 500 (FCM max)
        const batchSize = 500;
        let totalSuccessCount = 0;
        let totalFailureCount = 0;
        const allFailedTokensDetails = [];

        for (let i = 0; i < messages.length; i += batchSize) {
            const batchMessages = messages.slice(i, i + batchSize);
            console.log(`Processing batch ${i / batchSize + 1}/${Math.ceil(messages.length / batchSize)} with ${batchMessages.length} messages.`);
            console.log("batchMessages",batchMessages)
            try {
                // sendAll takes an array of messages with individual tokens
                const response = await messaging.sendEach(batchMessages);

                totalSuccessCount += response.successCount;
                totalFailureCount += response.failureCount;

                // Handle per-message failures
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, index) => {
                        if (!resp.success) {
                            const failedMsg = batchMessages[index];
                            const originalUserIdEntry = userIds.find(u => u.token === failedMsg.token);
                            allFailedTokensDetails.push({
                                token: failedMsg.token,
                                user_id: originalUserIdEntry ? originalUserIdEntry.user_id : 'unknown',
                                error: resp.error?.message,
                                errorCode: resp.error?.code
                            });

                            // Example invalid token cleanup:
                            if (['messaging/invalid-registration-token',
                                'messaging/not-found',
                                'messaging/registration-token-not-registered']
                                .includes(resp.error?.code)) {
                                console.warn(`Consider removing invalid token from DB: ${failedMsg.token}`);
                            }
                        }
                    });
                }

                console.log(`Batch sent: ${response.successCount} succeeded, ${response.failureCount} failed.`);
            } catch (err) {
                console.error(`Error sending batch:`, err);
                // if the entire batch fails:
                batchMessages.forEach(msg => {
                    const originalUserIdEntry = userIds.find(u => u.token === msg.token);
                    allFailedTokensDetails.push({
                        token: msg.token,
                        user_id: originalUserIdEntry ? originalUserIdEntry.user_id : 'unknown',
                        error: err.message,
                        errorCode: 'batch-send-error'
                    });
                });
                totalFailureCount += batchMessages.length;
            }
        }

        console.log(`--- Notification Send Summary ---`);
        console.log(`Total successful sends: ${totalSuccessCount}`);
        console.log(`Total failed sends: ${totalFailureCount}`);
        if (allFailedTokensDetails.length) {
            console.log('Failed tokens details:', JSON.stringify(allFailedTokensDetails, null, 2));
        }


        // Prepare notification history rows
        const notificationRows = userIds.map(tokenObj => ({
            token_id: tokenObj.token,
            user_id: tokenObj.user_id ?? null,
            user_image:tokenObj.user_image ?? null,
            ngo_id: getMetaValue(metaData, 'ngo_id'),
            request_id: getMetaValue(metaData, 'request_id'),
            post_id: getMetaValue(metaData, 'post_id'),
            notification_title: title,
            notification_details: description,
            notification_type: templateKey,
            image_object: JSON.stringify(metaData),
            is_viewed: 0,
            is_active: 1,
            created_by: getMetaValue(metaData, 'created_by'),
            created_at: new Date(),
        }));

        // Call your bulk create function for history
        await NotificationHistoryDAL.CreateBulkData(notificationRows);

        return {
            totalTokens: userIds.length,
            successCount: totalSuccessCount,
            failureCount: totalFailureCount,
            failedTokens: allFailedTokensDetails // Return failed tokens for further processing if needed
        };

    } catch (error) {
        console.error("Failed to send push notifications:", error);
        throw error;
    }
};

export default sendTemplateNotification;