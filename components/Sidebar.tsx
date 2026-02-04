"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { navLinks } from "@/constants"
import { Button } from "./ui/button"

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="flex size-full flex-col gap-4">
                <Link href="/" className="sidebar-logo">
                    <Image src="/assets/images/logo-text1.png" alt="logo" width={180} height={28} />
                </Link>

                <nav className="sidebar-nav">
                    <SignedIn>
                        <ul className="sidebar-nav_elements">
                            {navLinks.slice(0, 6).map((link) => {
                                const isActive = link.route === pathname

                                return (
                                    <li key={link.route} className={`sidebar-nav_element group text-white ${isActive ? "bg-purple-400" : "bg-purple-500"}`}>
                                        <Link className={`sidebar-link ${isActive && "brightness-200"}`} href={link.route}>
                                            <Image
                                                src={link.icon}
                                                alt="logo"
                                                width={24}
                                                height={24}
                                            />
                                            {link.label}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>


                        <ul className="sidebar-nav_elements">
                            {navLinks.slice(6).map((link) => {
                                const isActive = link.route === pathname

                                return (
                                    <li key={link.route} className={`sidebar-nav_element ${isActive ? "bg-purple-500 text-white" : "text-gray-700"
                                        }`}>
                                        <Link className="sidebar-link" href={link.route}>
                                            <Image
                                                src={link.icon}
                                                alt="logo"
                                                width={24}
                                                height={24}
                                                className={`${isActive && "brightness-200"}`}
                                            />
                                            {link.label}
                                        </Link>
                                    </li>
                                )
                            })}

                            <li className="flex-center cursor-pointer gap-2 p-2">
                                <UserButton afterSignOutUrl="/" showName />
                            </li>
                        </ul>
                    </SignedIn>

                    <SignedOut>
                        <Button asChild className="button absolute w-full bottom-0 bg-purple-400 hover:bg-blue-500 hover:text-purple-500">
                            <Link href="/sign-in">Login</Link>
                        </Button>
                    </SignedOut>
                </nav>
            </div>
        </aside>
    )
}

export default Sidebar