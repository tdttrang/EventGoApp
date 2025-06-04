export async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    data: { screen: "EventDetails" }, // nếu muốn điều hướng
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
