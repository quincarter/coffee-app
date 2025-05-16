import { Resend } from "resend";
import prisma from "@/app/lib/db";
import { Notification } from "@/app/types/notification";

const resend = new Resend(process.env.RESEND_API_KEY);

async function shouldSendEmail(userId: string): Promise<boolean> {
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId },
  });
  const should = !settings || settings.emailNotifications;
  return should;
}

async function getNotificationSubject(
  notification: Notification
): Promise<string> {
  const actor = await prisma.user.findUnique({
    where: { id: notification.actorId },
    select: { name: true },
  });
  switch (notification.type) {
    case `COMMENT`:
      return `${actor?.name} commented on your post`;
    case `COMMENT_REPLY`:
      return `${actor?.name} replied to your comment`;
    case `COMMENT_LIKE`:
      return `${actor?.name} liked your comment`;
    case `FAVORITE_COFFEE`:
      return `${actor?.name} favorited your coffee`;
    case `FAVORITE_BREW_PROFILE`:
      return `${actor?.name} favorited your brew profile`;
    case `FAVORITE_ROASTER`:
      return `${actor?.name} favorited your roaster`;
    default:
      return `New notification from BrewMe`;
  }
}

function getDetailLink(notification: Notification): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  switch (notification.entityType) {
    case "coffee":
      return `${baseUrl}/coffees/${notification.coffee?.id}#comment-${notification.commentId || ""}`;
    case "brew-profile":
      return `${baseUrl}/brew-profiles/${notification.brewProfile?.id}#comment-${notification.commentId || ""}`;
    case "roaster":
      return `${baseUrl}/roasters/${notification.roaster?.id}#comment-${notification.commentId || ""}`;
    default:
      return baseUrl;
  }
}

function getNotificationContent(notification: Notification): string {
  switch (notification.type) {
    case "COMMENT":
      return `commented on your ${notification.entityType}`;
    case "COMMENT_REPLY":
      return "replied to your comment";
    case "COMMENT_LIKE":
      return "liked your comment";
    case "FAVORITE_COFFEE":
      return "favorited your coffee";
    case "FAVORITE_BREW_PROFILE":
      return "favorited your brew profile";
    case "FAVORITE_ROASTER":
      return "favorited your roaster";
    default:
      return "performed an action";
  }
}

export async function sendNotificationEmail(notification: Notification) {
  try {
    // Check if we should send an email
    const shouldSend = await shouldSendEmail(notification.userId);
    if (!shouldSend) return false;

    // Get the user info and content details
    const [recipient, actor] = await Promise.all([
      prisma.user.findUnique({
        where: { id: notification.userId },
        select: { email: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: notification.actorId },
        select: { name: true, image: true },
      }),
    ]);

    // Get content image if available
    let contentImage: string | null = null;
    if (notification.entityType === "coffee" && notification.coffeeId) {
      const coffee = await prisma.coffee.findUnique({
        where: { id: notification.coffeeId },
        select: { image: true },
      });
      contentImage = coffee?.image ?? null;
    } else if (
      notification.entityType === "roaster" &&
      notification.roasterId
    ) {
      const roaster = await prisma.coffeeRoaster.findUnique({
        where: { id: notification.roasterId },
        select: { image: true },
      });
      contentImage = roaster?.image ?? null;
    }

    if (!recipient?.email || !actor?.name) return false;

    const detailLink = getDetailLink(notification);
    const settingsLink = `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=notifications`;
    const actorName = actor.name;
    const actionText = getNotificationContent(notification);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${await getNotificationSubject(notification)}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);">
            <!-- Header with Logo -->
            <div style="padding: 20px; text-align: center;">
              <img src="${process.env.NEXT_PUBLIC_APP_URL}/brew-me-logo.png" alt="BrewMe" style="height: 40px; width: auto;">
            </div>
            
            <!-- Main Content -->
            <div style="padding: 32px;">
              <!-- User Avatar and Action -->
              <div style="display: flex; align-items: center; margin-bottom: 24px;">
                <img src="${actor.image || `${process.env.NEXT_PUBLIC_APP_URL}/default-avatar.png`}" 
                     alt="${actorName}" 
                     style="width: 48px; height: 48px; border-radius: 9999px; margin-right: 16px; border: 2px solid #4b6bfb;">
                <div>
                  <p style="margin: 0; color: #a6adbb; font-size: 16px;">
                    <span style="font-weight: 600;">${actorName}</span> ${actionText}
                  </p>
                  <p style="margin: 4px 0 0 0; color: #6c7583; font-size: 14px;">
                    Just now
                  </p>
                </div>
              </div>

              ${
                notification.content
                  ? `
              <!-- Comment Content -->
              <div style="background-color: whitesmoke; border-radius: 0.5rem; padding: 16px; margin-bottom: 24px; border-left: 4px solid #4b6bfb;">
                <p style="color: black; margin: 0;">${notification.content}</p>
              </div>
              `
                  : ""
              }

              ${
                contentImage
                  ? `
              <!-- Content Image -->
              <div style="margin-bottom: 24px;">
                <img src="${contentImage}" alt="Content" style="width: 100%; border-radius: 0.5rem; border: 1px solid #191e24;">
              </div>
              `
                  : ""
              }

              <!-- Action Button -->
              <a href="${detailLink}" 
                 style="display: inline-block; background-color: rgb(141, 85, 15); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 0.5rem; font-weight: 500; margin-bottom: 24px;">
                View Details
              </a>

              <!-- Footer -->
              <div style="border-top: 1px solid #191e24; margin-top: 32px; padding-top: 24px;">
                <p style="color: #6c7583; font-size: 14px; margin: 0;">
                  You received this email because you have notifications enabled.
                  <a href="${settingsLink}" style="color: #4b6bfb; text-decoration: none;">Manage your notification settings</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const subject = await getNotificationSubject(notification);
    const response = await resend.emails.send({
      from: `BrewMe <no-reply@${process.env.RESEND_DOMAIN}>`,
      to: recipient.email,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending notification email:", error);
    console.error(
      "Error details:",
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error
    );
    return false;
  }
}
