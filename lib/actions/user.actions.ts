"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE USER SAFELY
export async function createUser() {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ clerkId: clerkUser.id });
    if (existingUser) {
      return JSON.parse(JSON.stringify(existingUser));
    }

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      `user_${clerkUser.id}@artifyai.com`;

    const username =
      clerkUser.username ||
      clerkUser.firstName ||
      email.split("@")[0];

    const photo =
      clerkUser.imageUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0B1220&color=22D3EE`;

    const newUser = await User.create({
      clerkId: clerkUser.id,
      email,
      username,
      photo,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      planId: 1,
      creditBalance: 10,
    });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// GET USER OR AUTO-CREATE
export async function getUserById() {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Not authenticated");
    }

    let user = await User.findOne({ clerkId: clerkUser.id });

    if (!user) {
      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress ||
        `user_${clerkUser.id}@artifyai.com`;

      const username =
        clerkUser.username ||
        clerkUser.firstName ||
        email.split("@")[0];

      const photo =
        clerkUser.imageUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0B1220&color=22D3EE`;

      user = await User.create({
        clerkId: clerkUser.id,
        email,
        username,
        photo,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        planId: 1,
        creditBalance: 10,
      });
    }

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE USER
export async function updateUser(userData: UpdateUserParams) {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Not authenticated");
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      userData,
      { new: true }
    );

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE USER
export async function deleteUser() {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Not authenticated");
    }

    const userToDelete = await User.findOne({ clerkId: clerkUser.id });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// UPDATE CREDITS
export async function updateCredits(creditFee: number) {
  try {
    await connectToDatabase();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Not authenticated");
    }

    const updatedUserCredits = await User.findOneAndUpdate(
      { clerkId: clerkUser.id },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
