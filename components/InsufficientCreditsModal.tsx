"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const InsufficientCreditsModal = () => {
    const router = useRouter();

    return (
        <AlertDialog defaultOpen>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex-between">
                        <p className="p-16-semibold text-dark-400 mb-2">Insufficient Credits</p>
                        <AlertDialogCancel
                            className="border-0 p-0 hover:bg-transparent"
                            onClick={() => router.push("/profile")}
                        >
                            <Image
                                src="/assets/icons/close.svg"
                                alt="credit coins"
                                width={24}
                                height={24}
                                className="cursor-pointer"
                            />
                        </AlertDialogCancel>
                    </div>

                    <Image
                        src="/assets/images/stacked-coins.png"
                        alt="credit coins"
                        width={462}
                        height={122}
                    />

                    <AlertDialogTitle className="p-24-bold text-dark-400 mt-2">
                        Oops.... Looks like you&#39;ve run out of free credits!
                    </AlertDialogTitle>

                    <AlertDialogDescription className="p-16-regular py-3">
                        No worries, though - you can keep enjoying our services by grabbing
                        more credits.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="
                        button
                         rounded-sm! w-full cursor-pointer border-purple-500! hover:text-purple-500! text-purple-500 bg-purple-100"
                        onClick={() => router.push("/profile")}
                    >
                        No, Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="
                        button
                         rounded-sm! w-full bg-purple-500  cursor-pointer hover:bg-purple-500"
                        onClick={() => router.push("/credits")}
                    >
                        Yes, Proceed
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};