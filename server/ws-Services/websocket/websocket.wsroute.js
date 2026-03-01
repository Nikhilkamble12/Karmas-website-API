import SosHistoryService from "../../services/sos_history/sos.history.service.js";
import UserTokenService from "../../services/user_tokens/user.tokens.service.js";
import sendTemplateNotification from "../../utils/helper/firebase.push.notification.js";
import getCurrentIndianTime from "../../utils/helper/get.current.time.ist.js";
import addMetaDataWhileCreateUpdate from "../../utils/helper/InsertIdAndDate.forOperation.js";
import LocalJsonHelper from "../../utils/helper/local.json.helper.js";
import notificationTemplates from "../../utils/helper/notification.templates.js";
import getSosUserJsonFileName from "../../utils/helper/sos_user_file_helper.js";
// const saveCurrentUserSos = "Sos/sos.current.json"
import WebSocket from "ws"


export default async function defineRoutes(wsRouter, activeConnections) {
  wsRouter.on('/sos-save', async (ws, wsRequest) => {
    try {
      // console.log("ws",ws)
      // console.log("wsRequest",wsRequest)
      const { location_coordinates } = wsRequest.data;
      const { user: { user_id } } = wsRequest
      // console.log("user_id",user_id)
      const getAllActiveSosUser = await LocalJsonHelper.getAll("sos_user_list","15d")
      // console.log("getAllActiveSosUser",getAllActiveSosUser.data)
      // Find user by ID in active SOS users
      const userSosStatus = getAllActiveSosUser.find(user => user.user_id == user_id);
      console.log("userSosStatus", userSosStatus)

      if (!userSosStatus) {
        // User is not found in active SOS users list
        console.log(`User with ID ${user_id} has not activated SOS yet.`);

        // Send response: SOS not activated yet
        ws.send(JSON.stringify({
          status: false,
          message: 'SOS not yet activated for this user.',
          data: {
            user_id: user_id,
          }
        }));
        return;
      }
      const fileDetails2 = {
                view_name: null,
                folder_name: "sos_user",
                json_file_name:getSosUserJsonFileName(checkWetherDataIsPresent[0].sos_user_id)
                }
      const getAllByUserId = await LocalJsonHelper.getAll(fileDetails2,"15d", "user_id", user_id)
      // console.log("getAllByUserId",getAllByUserId)

      // Define recipients based on active users
      let recipients = [];
      let userIds = [];
      const [latitude, longitude] = location_coordinates.split(',').map(coord => parseFloat(coord));

      const sos_history_object = {
        sos_id:userSosStatus.sos_id,
        user_id:userSosStatus.user_id,
        created_by:user_id,
        created_at:getCurrentIndianTime(),
        captured_time: getCurrentIndianTime(),
        latitude:latitude,
        longitude:longitude,
      }
      
      const createSosHistory = await SosHistoryService.createService(sos_history_object)
      for (const user of getAllByUserId) {
        if (user.is_active) {
          const targetWs = activeConnections.get(user.contact_user_id);  // Get WebSocket by contact user_id
          if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            console.log("Adding WebSocket to recipients array");
            recipients.push(targetWs);  // Add WebSocket to recipients array
          } else {
            console.log(`WebSocket not open for ${user.contact_name}. Sending notification.`);

            // Collect userIds for users who do not have an active WebSocket connection
            userIds.push(user.user_id);  // Collecting the user_id to send the notification
          }
        }
      }

      // Now, you can send the message to all active recipients
      recipients.forEach((targetWs) => {
        targetWs.send(JSON.stringify({
          event: 'sos',
          from: user_id,
          message: 'This is an SOS message!',
          location_coordinates: location_coordinates
        }));
        console.log(`Sent SOS message to ${targetWs.user.user_name} (user_id: ${targetWs.user.user_id})`);
      });

      if (userIds.length > 0) {
        try {
          const getAllUserToken = await UserTokenService.GetTokensByUserIds(userIds); // Get user tokens

          // Collect all user tokens (including those based on role)
          const allToken = [...getAllUserToken,];

          // Send notification to the users whose WebSocket was not found
          const template = notificationTemplates.sosIncoming({ username: userSosStatus.user_name });  // Customize as needed
          await sendTemplateNotification({
            templateKey: "Emergency-Alert",
            templateData: template,
            userIds: allToken,
            metaData: {
              created_by: user_id,  // Add any metadata like the requestor's info
              sos_id: userSosStatus.sos_id,
              user_id: user_id
            }
          });

          console.log(`Notification sent to users with ids: ${userIds}`);
        } catch (error) {
          console.error("Error sending notification:", error);
        }
      }
      const activeSos = {
                view_name: null,
                folder_name: "Sos",
                json_file_name:"sos.current.json"
                }
      await LocalJsonHelper.save(activeSos,sos_history_object,"sos_id",userSosStatus.sos_id,null,"15d")

      // ws.send(JSON.stringify({
      //   status: 'success',
      //   message: 'SOS acknowledged and broadcast initiated!',
      //   data:{
      //     user_id:user_id,
      //     loccation_coordinate:location_coordinates
      //   }
      // }));

      // if (Array.isArray(recipients)) {
      //   recipients.forEach(userId => {
      //     const targetWs = activeConnections.get(userId);
      //     if (targetWs && targetWs.readyState === WebSocket.OPEN) {
      //       targetWs.send(JSON.stringify({
      //         event: 'sos',
      //         from: wsRequest.user.user_id,
      //         message: message
      //       }));
      //     }
      //   });
      // }
    } catch (error) {
      console.log("error", error)
    }
  });
}
