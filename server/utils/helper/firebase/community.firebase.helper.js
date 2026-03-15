import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import { fileURLToPath } from "url";

/* ======================================================
   PATH RESOLUTION (ES6)
====================================================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ======================================================
   CONFIG
====================================================== */

const PROJECT_ID = "karmas-f6ac2";

const BASE_URL =
`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const COMMIT_URL =
`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

const serviceAccountPath = path.resolve(
  __dirname,
  "../../../middleware/external_documents/firebase/community.karmas.firebase.json"
);

/* ======================================================
   FIREBASE AUTH
====================================================== */

const auth = new GoogleAuth({
  keyFile: serviceAccountPath,
  scopes: ["https://www.googleapis.com/auth/datastore"]
});

/* ======================================================
   TOKEN CACHE
====================================================== */

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {

  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  cachedToken = tokenResponse.token;
  tokenExpiry = Date.now() + (50 * 60 * 1000); // 50 minutes

  return cachedToken;
}

/* ======================================================
   FIRESTORE REQUEST HELPERS
====================================================== */

async function firestorePost(collection, payload) {

  const token = await getAccessToken();

  const url = `${BASE_URL}/${collection}`;

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

async function firestoreCommit(payload) {

  const token = await getAccessToken();

  const response = await axios.post(COMMIT_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

/* ======================================================
   CREATE NGO COMMUNITY
====================================================== */

export async function createNgoCommunity({ ngoId, ngoName, userId }) {

  /* Create Community */

  const communityPayload = {
    fields: {

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
      }

    }
  };

  const communityDoc = await firestorePost("communities", communityPayload);

  const communityPath = communityDoc.name;
  const communityId = communityPath.split("/").pop();

  /* Create Announcement Chat Room */

  const chatPayload = {
    fields: {

      communityId: { stringValue: communityId },

      groupName: {
        stringValue: `${ngoName} Announcements`
      },

      createdBy: { stringValue: userId.toString() },

      isGroup: { booleanValue: true },
      isCommunityGroup: { booleanValue: true },
      isAnnouncementGroup: { booleanValue: true },

      participants: {
        arrayValue: {
          values: [{ stringValue: userId.toString() }]
        }
      }

    }
  };

  const chatDoc = await firestorePost("chat_rooms", chatPayload);

  const chatPath = chatDoc.name;
  const announcementGroupId = chatPath.split("/").pop();

  return {
    communityId,
    announcementGroupId
  };
}

/* ======================================================
   ADD ADMIN TO COMMUNITY (ARRAY UNION)
====================================================== */

export async function addAdminToCommunity({ communityId, userId }) {

  const payload = {
    writes: [
      {
        transform: {
          document: `projects/${PROJECT_ID}/databases/(default)/documents/communities/${communityId}`,
          fieldTransforms: [
            {
              fieldPath: "admins",
              appendMissingElements: {
                values: [{ stringValue: userId.toString() }]
              }
            }
          ]
        }
      }
    ]
  };

  return firestoreCommit(payload);
}

/* ======================================================
   ADD MEMBER / EMPLOYEE TO COMMUNITY
====================================================== */

export async function addMemberToCommunity({ communityId, userId }) {

  const payload = {
    writes: [
      {
        transform: {
          document: `projects/${PROJECT_ID}/databases/(default)/documents/communities/${communityId}`,
          fieldTransforms: [
            {
              fieldPath: "members",
              appendMissingElements: {
                values: [{ stringValue: userId.toString() }]
              }
            }
          ]
        }
      }
    ]
  };

  return firestoreCommit(payload);
}