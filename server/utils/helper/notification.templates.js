const notificationTemplates = {
  requestApproved: ({ ngoName, requestName }) => ({
    title: "Request Approved",
    description: `${ngoName} has approved your request '${requestName}'.`
  }),

  requestInitiated: ({ ngoName, requestName }) => ({
    title: "Request Submitted",
    description: `Your request '${requestName}' has been submitted by ${ngoName}.`
  }), 
  newRequestForNgo: ({ requestName, requesterName }) => ({
  title: "New Request Received",
  description: `You have received a new request titled '${requestName}' from ${requesterName}.`
  }),
  requestReceivedForEvaluation: ({ requestName }) => ({
    title: "Request Received",
    description: `We have received your request '${requestName}' and it is currently being evaluated.`
  }),requestRejected: ({ ngoName, requestName }) => ({
  title: "Request Rejected",
  description: `${ngoName} has rejected your request '${requestName}'.`
}),

  requestCompleted: ({ requestName, requestID }) => ({
    title: "Request Completed",
    description: `Your request '${requestName}' (ID: ${requestID}) has been marked as completed.`
  }),

  requestAccepted: ({ ngoName, requestName }) => ({
    title: "Request Accepted",
    description: `${ngoName} has accepted your request '${requestName}' and will take action soon.`
  }),

  requestLiked: ({ username }) => ({
    title: "Request Liked",
    description: `Your request received a like from ${username}.`
  }),

  requestComment: ({ username }) => ({
    title: "New Comment on Request",
    description: `${username} commented on your request.`
  }),

  postComment: ({ username }) => ({
    title: "New Comment",
    description: `${username} commented on your post.`
  }),

  postLiked: ({ username }) => ({
    title: "Post Liked",
    description: `Your post received a like from ${username}.`
  }),

  friendFollowed: ({ username }) => ({
    title: "New Follower",
    description: `${username} has started following you.`
  }),

  friendRequestSent: ({ username }) => ({
    title: "Friend Request Sent",
    description: `You sent a friend request to ${username}.`
  }),
  followRequestReceived: ({ username }) => ({
    title: "New Follow Request",
    description: `${username} wants to follow you.`
  }),

  friendRequestAccepted: ({ username }) => ({
    title: "Friend Request Accepted",
    description: `${username} accepted your friend request.`
  }),

  friendRequestRejected: ({ username }) => ({
    title: "Friend Request Rejected",
    description: `${username} rejected your friend request.`
  }),

  sosOutgoing: () => ({
    title: "SOS Alert Sent",
    description: "You activated SOS. Tap here to open the map and share your location."
  }),

  sosIncoming: ({ username }) => ({
    title: `Emergency Alert from ${username}`,
    description: `${username} has activated SOS. Tap to view their location on the map.`
  }),
  sosLocationUpdateRequest:({})=>({
    title: `Send Live Location`,
    description: `Send Live Location it more than 40 secs`
  }),UserHasTaggedYou:({ request})=>({
     title: `User has Tagged You In Request`,
    description: `Someone Just Tagged You In Request ${request}`
  }),UserHasTaggedYouPost:({Post})=>({
    title: `User has Tagged You In Post`,
    description: `Someone Just Tagged You In Post ${Post}`
  })
};

export default notificationTemplates