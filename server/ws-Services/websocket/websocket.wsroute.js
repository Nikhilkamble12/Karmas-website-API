export default function defineRoutes(wsRouter, activeConnections) {
  wsRouter.on('/sos', (ws, wsRequest) => {
    const { recipients, message } = wsRequest.data;

    ws.send(JSON.stringify({
      status: 'success',
      message: 'SOS acknowledged and broadcast initiated!'
    }));

    if (Array.isArray(recipients)) {
      recipients.forEach(userId => {
        const targetWs = activeConnections.get(userId);
        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(JSON.stringify({
            event: 'sos',
            from: wsRequest.user.user_id,
            message: message
          }));
        }
      });
    }
  });
}
