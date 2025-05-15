import { prisma } from "@/app/lib/db";
import { getServerUser } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        likes: {
          where: {
            userId: user.id,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const existingLike = comment.likes[0];
    let liked: boolean;
    let count: number;
    let updatedComment;

    if (existingLike) {
      // Unlike
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id,
        },
      });
      liked = false;
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId: id,
        },
      });
      liked = true;
    }

    // Get updated comment state after like/unlike operation
    updatedComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        likes: {
          select: {
            id: true,
            userId: true,
            commentId: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate the count from the actual likes array
    count = (updatedComment?.likes || []).length;

    return NextResponse.json({
      liked,
      count,
      likes: updatedComment?.likes || [],
    });
  } catch (error) {
    console.error("Error handling comment like:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
