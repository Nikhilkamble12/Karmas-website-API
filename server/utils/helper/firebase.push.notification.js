import admin from 'firebase-admin';
import serviceAccount from "../../middleware/external_documents/firebase/karmas.firebase.json" assert { type: 'json' };
import NotificationHistoryDAL from '../../services/notification_history/notification.history.data.layer';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const getMetaValue = (metaData, key) => {
  return metaData && Object.prototype.hasOwnProperty.call(metaData, key)
    ? metaData[key]
    : null;
};

const sendTemplateNotification = async ({
  templateKey,
  templateData,
  userIds,
  metaData = {}
}) => {
  try {
    // 1. Build message from template
    const templateFn = notificationTemplates[templateKey];
    if (!templateFn) throw new Error(`Template ${templateKey} not found`);

    const { title, description } = templateFn(templateData);

    // 2. Fetch user tokens
    const tokens = await UserTokenService.GetTokensByUserIds(userIds);

    if (tokens.length === 0) {
      console.log("No active tokens found for given user(s).");
      return;
    }

    // 3. Prepare Firebase messages
    const messages = tokens.map(({ token }) => ({
      token,
      notification: {
        title,
        body: description
      },
      data: {
        type: templateKey
        // you can add metadata here if needed
      }
    }));

    // 4. Send in batch (Firebase supports up to 500 at once)
    const response = await admin.messaging().sendAll(messages);
    console.log(`Sent ${response.successCount} notifications successfully.`);
    const notificationRows = tokens.map(tokenObj => ({
      token_id: tokenObj.token,
      user_id: tokenObj.user_id ?? null,
      ngo_id: getMetaValue(metaData, 'ngo_id'),
      request_id: getMetaValue(metaData, 'request_id'),
      post_id: getMetaValue(metaData, 'post_id'),
      notification_title: title,
      notification_details: description,
      notification_type: templateKey,
      is_viewed: 0,
      is_active: 1,
      created_by: getMetaValue(metaData, 'created_by'),
      created_at: new Date(),
    }));

    // Call your bulk create function (assumed implemented)
    await NotificationHistoryDAL.CreateBulkData(notificationRows);

    return response;
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    throw error;
  }
};

export default sendTemplateNotification
   