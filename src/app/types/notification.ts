export type NotificationEntityType =
  | "coffee"
  | "brew-profile"
  | "roaster"
  | "comment";

export type NotificationType =
  | "COMMENT"
  | "COMMENT_REPLY"
  | "COMMENT_LIKE"
  | "FAVORITE_COFFEE"
  | "FAVORITE_BREW_PROFILE"
  | "FAVORITE_ROASTER";

export interface Entity {
  id: string;
  name?: string;
  image?: string | null;
}

export interface NotificationBase {
  id: string;
  type: NotificationType;
  userId: string;
  actorId: string;
  read: boolean;
  entityType: NotificationEntityType;
  entityId: string;
  content?: string | null;
  createdAt: Date;
  updatedAt: Date;
  commentId?: string | null;
  coffeeId?: string | null;
  brewProfileId?: string | null;
  roasterId?: string | null;
  actor: {
    id: string;
    name: string;
    image?: string | null;
  };
}

export interface CommentNotification extends NotificationBase {
  type: "COMMENT" | "COMMENT_REPLY" | "COMMENT_LIKE";
  content: string;
  commentId: string;
  coffee?: Entity | null;
  brewProfile?: Entity | null;
  roaster?: Entity | null;
}

export interface FavoriteNotification extends NotificationBase {
  type: "FAVORITE_COFFEE" | "FAVORITE_BREW_PROFILE" | "FAVORITE_ROASTER";
  coffee?: Entity | null;
  brewProfile?: Entity | null;
  roaster?: Entity | null;
}

export type Notification = CommentNotification | FavoriteNotification;

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  commentNotifications: boolean;
  likeNotifications: boolean;
  favoriteNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}
