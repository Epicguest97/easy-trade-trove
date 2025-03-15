
import { useState, useEffect } from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type HeaderProps = {
  onMenuClick: () => void;
};

const Header = ({ onMenuClick }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScroll(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      "fixed top-0 right-0 left-0 z-40 transition-all duration-300",
      "flex items-center justify-between h-16 px-4 lg:px-6",
      scrolled ? "glass" : "bg-transparent"
    )}>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center gap-2">
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 bg-background/50"
          />
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
