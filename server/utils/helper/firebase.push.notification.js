import admin from 'firebase-admin';
import serviceAccount from "../../middleware/external_documents/firebase/karmas.firebase.json" assert { type: 'json' };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const sendTemplateNotification = async ({
  templateKey,
  templateData,
  userIds
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

    return response;
  } catch (error) {
    console.error("Failed to send push notifications:", error);
    throw error;
  }
};

export default sendTemplateNotification
   