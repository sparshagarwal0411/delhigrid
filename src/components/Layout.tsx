import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { FloatingActionButtons } from "@/components/FloatingActionButtons";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar is fixed, so it doesn't take up space in the flow */}
      <Navbar />
      
      {/* ADDED: 'pt-16' (padding-top: 64px). 
         This pushes the AnnouncementBar and Main Content down 
         to prevent them from hiding behind the fixed Navbar.
      */}
      <div className="pt-16 flex flex-col flex-1">
        <AnnouncementBar />
        <main className="flex-1">{children}</main>
      </div>

      {showFooter && <Footer />}
      <FloatingActionButtons />
    </div>
  );
}