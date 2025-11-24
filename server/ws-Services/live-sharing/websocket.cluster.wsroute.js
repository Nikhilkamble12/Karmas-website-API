import SosHistoryService from "../../services/sos_history/sos.history.service.js";
import UserTokenService from "../../services/user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import getCurrentIndianTime from "../../utils/helper/get.current.time.ist.js";
import LocalJsonHelper from "../../utils/helper/local.json.helper.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import TABLE_VIEW_FOLDER_MAP from "../../utils/constants/id_constant/local.json.constant.js";
const activeSos = {
                view_name: null,
                folder_name: "Sos",
                json_file_name:"sos.current.json"
                }
const saveCurrentUserSos = "Sos/sos.current.json"
import WebSocket from "ws";

function getTimeDifference(lastCapturedTime, currentTime) {
    // Convert string timestamps to Date objects
    const lastCapturedDate = new Date(lastCapturedTime);
    const currentDate = new Date(currentTime);

    // Calculate the difference in milliseconds (currentTime - lastCapturedTime)
    const timeDifferenceInMilliseconds = currentDate - lastCapturedDate;

    // Always return the absolute difference to avoid negative values
    const timeDifferenceInSeconds = Math.abs(timeDifferenceInMilliseconds / 1000);
    const timeDifferenceInMinutes = Math.abs(timeDifferenceInMilliseconds / 60000);
    
    // Calculate remaining milliseconds after seconds
    const remainingMilliseconds = timeDifferenceInMilliseconds % 1000;

    return {
        timeDifferenceInMilliseconds: Math.abs(timeDifferenceInMilliseconds), // in milliseconds
        timeDifferenceInSeconds: timeDifferenceInSeconds, // in seconds
        timeDifferenceInMinutes: timeDifferenceInMinutes, // in minutes
        remainingMilliseconds: remainingMilliseconds, // remaining milliseconds
    };
}

export default async function defineRoutes(wsRouter, activeConnections) {
    async function checkSosUsers() {
    try {
      // Fetch all active SOS users from the file
      const getAllActiveSosUser = await LocalJsonHelper.getAll("sos_user_list","15d");
      const currentTime = getCurrentIndianTime(); // Current timestamp in IST
      const reminderThreshold = 40 * 1000; // 40 seconds in milliseconds
      const checkThreshold = 10 * 1000; // Check every 10 seconds
        if(getAllActiveSosUser && getAllActiveSosUser && getAllActiveSosUser.length>0){
      for (const user of getAllActiveSosUser) {
        if (user.is_active) {
        //   const userSosStatus = user; // Get user's SOS status

          // Get the user's SOS history to check the last captured time
          const userSosStatus = await LocalJsonHelper.getAll(activeSos,"15d", "sos_id",user.sos_id);
            // console.log("userSosStatus",userSosStatus)
          if (userSosStatus && userSosStatus.length>0) {
            console.log("userSosStatus",userSosStatus)
            const lastCapturedTime = userSosStatus[0].captured_time;
            // console.log("lastCapturedTime",lastCapturedTime)
            // console.log("currentTime",currentTime)
            const timeDifference = getTimeDifference(currentTime, lastCapturedTime);
            // console.log("timeDifference",timeDifference)
            // console.log("reminderThreshold",reminderThreshold)
            // If the last update was more than 40 seconds ago, ask the user to resend the location
            if (timeDifference.timeDifferenceInMilliseconds >= reminderThreshold) {
                // console.log("user",user)
              const targetWs = activeConnections.get(user.user_id); // Get WebSocket by contact user_id

              // If WebSocket is active, ask the user to resend their location
              if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                // console.log(`Requesting location update from user: ${user.contact_name}`);
                targetWs.send(JSON.stringify({
                  event: 'sos-location-update-request',
                  message: 'Please resend your current location.',
                  user_id: user.contact_user_id
                }));
              } else {
                // If WebSocket is not active, send a notification via Firebase
                const template = notificationTemplates.sosLocationUpdateRequest({ username: user.contact_name });
                const userTokens = await UserTokenService.GetTokensByUserIds([user.user_id]);

                await sendTemplateNotification({
                  templateKey: "Location-Update-Request",
                  templateData: template,
                  userIds: userTokens,
                  metaData: {
                    sos_id: userSosStatus.sos_id,
                    user_id: user.contact_user_id
                  }
                });
              }
            }
          }
        }
      }
    }
    } catch (error) {
      console.error("Error in checking SOS users:", error);
    }
  }

  // Set up a periodic check that runs every 10 seconds
  setInterval(async () => {
    console.log("Checking SOS users for location updates...");
    await checkSosUsers();
  }, 30 * 1000); // Run the check every 30 seconds

}