"use server";

import { revalidatePath } from "next/cache";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// =============================
// CREATE USER
// =============================
export async function createUser(
  clerkId: string,
  clerkData: any
) {
  try {
    await connectToDatabase();

    const existingUser = await User.findOne({ clerkId });
    if (existingUser) {
      return JSON.parse(JSON.stringify(existingUser));
    }

    const email =
      clerkData?.emailAddresses?.[0]?.emailAddress ||
      `user_${clerkId}@artifyai.com`;

    // 🔥 Unique username to prevent duplicate key errors
    const username = `user_${clerkId}`;

    const photo =
      clerkData?.imageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=0B1220&color=22D3EE`;

    const newUser = await User.create({
      clerkId,
      email,
      username,
      photo,
      firstName: clerkData?.firstName || "",
      lastName: clerkData?.lastName || "",
      planId: 1,
      creditBalance: 10,
    });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// =============================
// GET USER
// =============================
export async function getUserById(clerkId: string) {
  try {
    await connectToDatabase();

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// =============================
// UPDATE USER
// =============================
export async function updateUser(
  clerkId: string,
  userData: UpdateUserParams
) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      userData,
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// =============================
// DELETE USER
// =============================
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);

    revalidatePath("/");

    return deletedUser
      ? JSON.parse(JSON.stringify(deletedUser))
      : null;
  } catch (error) {
    handleError(error);
  }
}

// =============================
// UPDATE CREDITS (SAFE VERSION)
// =============================
export async function updateCredits(
  clerkId: string,
  creditFee: number
) {
  try {
    await connectToDatabase();

    // 🔥 SAFETY FIX (prevents Cast to number error)
    const safeCreditFee =
      typeof creditFee === "number" ? creditFee : 0;

    const updatedUserCredits = await User.findOneAndUpdate(
      { clerkId },
      { $inc: { creditBalance: safeCreditFee } },
      { new: true }
    );

    if (!updatedUserCredits) {
      throw new Error("User credits update failed");
    }

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
