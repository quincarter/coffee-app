import { Resend } from "resend";
import { Notification } from "@/app/types/notification";

export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendNotificationEmailOptions {
  notification: Notification;
  userEmail: string;
  userName: string;
}

const getEmailSubject = (notification: Notification) => {
  const actorName = notification.actor.name;

  switch (notification.type) {
    case "COMMENT":
      return `${actorName} commented on your ${notification.entityType}`;
    case "COMMENT_REPLY":
      return `${actorName} replied to your comment`;
    case "COMMENT_LIKE":
      return `${actorName} liked your comment`;
    case "FAVORITE_COFFEE":
      return `${actorName} favorited your coffee`;
    case "FAVORITE_BREW_PROFILE":
      return `${actorName} favorited your brew profile`;
    case "FAVORITE_ROASTER":
      return `${actorName} favorited a roaster`;
    default:
      return "New notification from BrewMe";
  }
};

const getEmailContent = (notification: Notification, userName: string) => {
  const actorName = notification.actor.name;
  let actionText = "";
  let entityLink = "";

  switch (notification.entityType) {
    case "comment":
      entityLink = notification.coffee
        ? `/coffees/${notification.coffee.id}`
        : notification.brewProfile
          ? `/brew-profile/${notification.brewProfile.id}`
          : `/roaster/${notification.roaster?.id}`;
      break;
    case "coffee":
      entityLink = `/coffees/${notification.coffee?.id}`;
      break;
    case "brew-profile":
      entityLink = `/brew-profiles/${notification.brewProfile?.id}`;
      break;
    case "roaster":
      entityLink = `/roasters/${notification.roaster?.id}`;
      break;
  }

  switch (notification.type) {
    case "COMMENT":
      actionText = `commented on your ${notification.entityType}`;
      break;
    case "COMMENT_REPLY":
      actionText = "replied to your comment";
      break;
    case "COMMENT_LIKE":
      actionText = "liked your comment";
      break;
    case "FAVORITE_COFFEE":
      actionText = "favorited your coffee";
      break;
    case "FAVORITE_BREW_PROFILE":
      actionText = "favorited your brew profile";
      break;
    case "FAVORITE_ROASTER":
      actionText = "favorited a roaster";
      break;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const actionUrl = `${baseUrl}${entityLink}`;

  return {
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${getEmailSubject(notification)}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hey ${userName}!</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              <strong>${actorName}</strong> ${actionText}
            </p>
            ${
              notification.content
                ? `
            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
              <p style="color: #4b5563; margin: 0;">${notification.content}</p>
            </div>
            `
                : ""
            }
            <a href="${actionUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; margin-top: 20px;">
              View on BrewMe
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              You received this email because you have email notifications enabled. 
              You can manage your notification settings in your <a href="${baseUrl}/settings?tab=notifications" style="color: #3b82f6; text-decoration: none;">account settings</a>.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
Hey ${userName}!

${actorName} ${actionText}

${
  notification.content
    ? `"${notification.content}"

`
    : ""
}View on BrewMe: ${actionUrl}

You received this email because you have email notifications enabled. 
You can manage your notification settings here: ${baseUrl}/notifications/settings
    `.trim(),
  };
};

export const sendNotificationEmail = async ({
  notification,
  userEmail,
  userName,
}: SendNotificationEmailOptions) => {
  try {
    const { html, text } = getEmailContent(notification, userName);

    await resend.emails.send({
      from: `BrewMe <no-reply@${process.env.RESEND_DOMAIN}>`,
      to: userEmail,
      subject: getEmailSubject(notification),
      html,
      text,
    });

    return true;
  } catch (error) {
    console.error("Error sending notification email:", error);
    return false;
  }
};
