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
        
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-neutral-300 hover:text-white text-sm font-medium transition-colors">
            Features
          </Link>
          <Link href="#" className="text-neutral-300 hover:text-white text-sm font-medium transition-colors">
            How It Works
          </Link>
          <Link href="#" className="text-neutral-300 hover:text-white text-sm font-medium transition-colors">
            Pricing
          </Link>
          <Link href="#" className="text-neutral-300 hover:text-white text-sm font-medium transition-colors">
            FAQ
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link href="#" className="hidden md:block text-neutral-300 hover:text-white text-sm font-medium transition-colors">
            Log in
          </Link>
          <Button variant="outline" className="hidden md:flex border-neutral-700 hover:border-primary/50 hover:bg-primary/10">
            Get Started
          </Button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-card border-neutral-800 pt-12">
              <nav className="flex flex-col space-y-4">
                <Link href="#" className="text-neutral-300 hover:text-white text-lg font-medium" onClick={closeMenu}>
                  Features
                </Link>
                <Link href="#" className="text-neutral-300 hover:text-white text-lg font-medium" onClick={closeMenu}>
                  How It Works
                </Link>
                <Link href="#" className="text-neutral-300 hover:text-white text-lg font-medium" onClick={closeMenu}>
                  Pricing
                </Link>
                <Link href="#" className="text-neutral-300 hover:text-white text-lg font-medium" onClick={closeMenu}>
                  FAQ
                </Link>
                <Link href="#" className="text-neutral-300 hover:text-white text-lg font-medium" onClick={closeMenu}>
                  Log in
                </Link>
                <Button className="mt-4 w-full bg-gradient-to-r from-primary to-accent text-white" onClick={closeMenu}>
                  Get Started
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
