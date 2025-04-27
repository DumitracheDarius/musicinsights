import { useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
      <header className="w-full py-5 px-6 backdrop-blur-sm bg-background/90 fixed top-0 z-50 border-b border-neutral-800/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Logo size="sm" />
            <span className="text-lg font-semibold tracking-wide">SongScape</span>
          </Link>

          <div className="flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-neutral-800 pt-12">
                <div className="text-neutral-400 text-center text-sm">
                  No menu items yet
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  );
}
