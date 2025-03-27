import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="w-full py-8 px-6 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
            <Logo size="sm" />
            <span className="text-sm font-medium text-neutral-300">SongScape Analytics</span>
          </Link>
          
          <div className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} SongScape. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
