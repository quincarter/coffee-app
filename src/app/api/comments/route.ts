import { prisma } from "@/app/lib/db";
import { getServerUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, entityId, entityType, parentId } = await req.json();
    if (!content?.trim() || !entityId || !entityType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the comment with the appropriate entity relation
    const commentData: any = {
      content,
      userId: user.id,
      parentId,
    };

    switch (entityType) {
      case "coffee":
        commentData.coffeeId = entityId;
        break;
      case "brewProfile":
        commentData.brewProfileId = entityId;
        break;
      case "roaster":
        commentData.roasterId = entityId;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid entity type" },
          { status: 400 }
        );
    }

    const comment = await prisma.comment.create({
      data: commentData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            likes: true,
          },
        },
        likes: true,
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get("entityId");
    const entityType = searchParams.get("entityType");

    if (!entityId || !entityType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Prepare the where clause based on entity type
    const where: any = { parentId: null }; // Only fetch top-level comments
    switch (entityType) {
      case "coffee":
        where.coffeeId = entityId;
        break;
      case "brewProfile":
        where.brewProfileId = entityId;
        break;
      case "roaster":
        where.roasterId = entityId;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid entity type" },
          { status: 400 }
        );
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            likes: {
              select: {
                id: true,
                userId: true,
                commentId: true,
                createdAt: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                likes: {
                  select: {
                    id: true,
                    userId: true,
                    commentId: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            userId: true,
            commentId: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    // Add like count to the response
    const commentsWithCounts = comments.map((comment) => ({
      ...comment,
      _count: {
        ...comment._count,
        likes: comment.likes.length,
      },
    }));

    return NextResponse.json(commentsWithCounts);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
