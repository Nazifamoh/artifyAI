"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { navLinks } from "@/constants"
import { Button } from "./ui/button"

const MobileNav = () => {
    const pathname = usePathname();

    return (
        <header className="header lg:hidden">
            <Link href="/" className="flex items-center gap-2 md:py-2">
                <Image
                    src="/assets/images/logo-text1.png"
                    alt="logo"
                    width={180}
                    height={28}
                />
            </Link>

            <nav className="flex gap-2">
                <SignedIn>
                    <UserButton afterSignOutUrl="/" />

                    <Sheet>
                        <SheetTrigger>
                            <Image
                                src="/assets/icons/menu.svg"
                                alt="menu"
                                width={32}
                                height={32}
                                className="cursor-pointer"
                            />
                        </SheetTrigger>
                        <SheetContent className="sheet-content sm:w-64 flex flex-col items-center justify-center">
                            <>
                                <ul className="header-nav_elements">
                                    {navLinks.map((link) => {
                                        const isActive = link.route === pathname

                                        return (
                                            <li
                                                className={"p-4 flex whitespace-nowrap text-dark-700"}
                                                key={link.route}
                                            >
                                                <SheetClose asChild>
                                                    <Link
                                                        className={`${isActive && "text-purple-400"
                                                            } sidebar-link cursor-pointer`}
                                                        href={link.route}
                                                    >
                                                        <Image src={link.icon} alt="logo" width={24} height={24} />
                                                        {link.label}
                                                    </Link>
                                                </SheetClose>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </>
                        </SheetContent>
                    </Sheet>
                </SignedIn>

                <SignedOut>
                    <Button asChild className="button bg-purple-400 hover:bg-blue-500 hover:text-purple-500">
                        <Link href="/sign-in">Login</Link>
                    </Button>
                </SignedOut>
            </nav>
        </header>
    )
}

export default MobileNav