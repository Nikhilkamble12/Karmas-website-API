const notificationTemplates = {
  requestApproved: ({ ngoName, requestName }) => ({
    title: "Request Approved",
    description: `${ngoName} has approved your request '${requestName}'.`
  }),

  requestInitiated: ({ ngoName, requestName }) => ({
    title: "Request Submitted",
    description: `Your request '${requestName}' has been submitted by ${ngoName}.`
  }),

  requestCompleted: ({ requestName, requestID }) => ({
    title: "Request Completed",
    description: `Your request '${requestName}' (ID: ${requestID}) has been marked as completed.`
  }),

  requestAccepted: ({ ngoName, requestName }) => ({
    title: "Request Accepted",
    description: `${ngoName} has accepted your request '${requestName}' and will take action soon.`
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
  })
};

export default notificationTemplates