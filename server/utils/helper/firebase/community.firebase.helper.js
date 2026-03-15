import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

/* resolve absolute path for ES6 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = "karmas-f6ac2";

const BASE_URL =
`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

/*
  SERVICE ACCOUNT FILE PATH
*/
const serviceAccountPath = path.resolve(
  __dirname,
  "../../../middleware/external_documents/firebase/community.karmas.firebase.json"
);

/*
  FIREBASE AUTH
*/
const auth = new GoogleAuth({
  keyFile: serviceAccountPath,
  scopes: ["https://www.googleapis.com/auth/datastore"]
});

async function getAccessToken() {
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();

  return accessTokenResponse.token;
}

/**
 * Generic Firestore PATCH
 */
async function firestorePatch(url, payload) {

  
  const token = await getAccessToken();

  return axios.patch(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

}



/* ======================================================
   CREATE NGO COMMUNITY
====================================================== */
export async function createNgoCommunity({ ngoId, ngoName, userId }) {

  const communityId = uuidv4();
  const announcementGroupId = uuidv4();

  const communityUrl = `${BASE_URL}/communities/${communityId}`;
  const chatRoomUrl = `${BASE_URL}/chat_rooms/${announcementGroupId}`;

  const communityPayload = {
    fields: {
      id: { stringValue: communityId },
      name: { stringValue: ngoName },
      description: {
        stringValue: `Official community for ${ngoName}`
      },
      ngoId: { integerValue: ngoId },
      createdBy: { stringValue: userId.toString() },

      admins: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      },

      members: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      },

      announcementGroupId: {
        stringValue: announcementGroupId
      }
    }
  };

  const chatRoomPayload = {
    fields: {
      id: { stringValue: announcementGroupId },

      participants: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      },

      groupName: {
        stringValue: `${ngoName} Announcements`
      },

      createdBy: { stringValue: userId.toString() },

      isGroup: { booleanValue: true },
      isCommunityGroup: { booleanValue: true },
      isAnnouncementGroup: { booleanValue: true },

      communityId: { stringValue: communityId }
    }
  };

  await firestorePatch(communityUrl, communityPayload);
  await firestorePatch(chatRoomUrl, chatRoomPayload);

  return {
    communityId:communityId,
    announcementGroupId:announcementGroupId
  };

}





/* ======================================================
   ADD ADMIN
====================================================== */
export async function addAdminToCommunity({ communityId, userId }) {

  const communityUrl = `${BASE_URL}/communities/${communityId}`;

  const payload = {
    fields: {
      admins: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      }
    }
  };

  await firestorePatch(communityUrl, payload);

}





/* ======================================================
   ADD MEMBER / EMPLOYEE
====================================================== */
export async function addMemberToCommunity({ communityId, userId }) {

  const communityUrl = `${BASE_URL}/communities/${communityId}`;

  const payload = {
    fields: {
      members: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      }
    }
  };

  await firestorePatch(communityUrl, payload);

}