import MobileNav from "@/components/MobileNav"
import Sidebar from "@/components/Sidebar"
import { Toaster } from "@/components/ui/sonner"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="root">
            <Sidebar />
            <MobileNav />

            <div className="root-container">
                <div className="wrapper">
                    {children}
                </div>
            </div>

            <Toaster richColors />
        </main>
    )
}

export default Layout