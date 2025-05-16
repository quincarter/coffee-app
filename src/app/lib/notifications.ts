import prisma from "@/app/lib/db";
import { sendNotificationEmail } from "@/app/lib/email/notification";
import { Notification, NotificationType } from "@/app/types/notification";

interface CreateNotificationOptions {
  type: NotificationType;
  userId: string;
  actorId: string;
  entityType: "comment" | "coffee" | "brew-profile" | "roaster";
  entityId: string;
  content?: string;
  commentId?: string;
  coffeeId?: string;
  brewProfileId?: string;
  roasterId?: string;
}

export const createNotification = async (
  options: CreateNotificationOptions
) => {
  try {
    console.log("Starting notification creation:", options.type);

    // Don't create notification if actor is the same as user
    if (options.userId === options.actorId) {
      console.log("Skipping notification - actor is the same as user");
      return null;
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        type: options.type,
        userId: options.userId,
        actorId: options.actorId,
        entityType: options.entityType,
        entityId: options.entityId,
        content: options.content,
        commentId: options.commentId,
        coffeeId: options.coffeeId,
        brewProfileId: options.brewProfileId,
        roasterId: options.roasterId,
      },
      include: {
        user: true,
        actor: true,
        comment: true,
        coffee: true,
        brewProfile: true,
        roaster: true,
      },
    });

    console.log("Notification created:", notification.id);

    // Check if user has email notifications enabled
    const userSettings = await prisma.notificationSettings.findUnique({
      where: { userId: options.userId },
    });

    console.log("User notification settings:", {
      userId: options.userId,
      emailNotifications: userSettings?.emailNotifications,
      hasSettings: !!userSettings,
    });

    // Send email if no settings exist (default to true) or if explicitly enabled
    if (!userSettings || userSettings.emailNotifications) {
      console.log("Attempting to send email notification");
      // Send email notification
      const emailResult = await sendNotificationEmail(
        notification as Notification
      );
      console.log("Email notification result:", emailResult);
    } else {
      console.log("Email notifications not enabled for user");
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
    data: {
      read: true,
    },
  });
};

export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  return prisma.notification.delete({
    where: {
      id: notificationId,
      userId, // Ensure user owns the notification
    },
  });
};

export const getUnreadNotificationCount = async (userId: string) => {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
};

export const getUserNotifications = async (userId: string, limit?: number) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
        },
      },
      coffee: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      brewProfile: {
        select: {
          id: true,
          coffeeAmount: true,
          waterAmount: true,
          ratio: true,
        },
      },
      roaster: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    ...(limit ? { take: limit } : {}),
  });
};
