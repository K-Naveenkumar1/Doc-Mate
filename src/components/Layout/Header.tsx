
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ActivityIcon, Bell, Search } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
 
const Header: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="bg-black/60 backdrop-blur-xl border-b border-white/10 z-50 fixed top-0 left-0 right-0 shadow-lg">
      <div className="healthcare-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ActivityIcon className="h-8 w-8 text-primary animate-pulse" />
            <span className="text-2xl font-bold text-gradient luxury-text-shadow">Doc-Mate</span>
          </Link>
          
          <div className="hidden md:flex items-center bg-black/40 rounded-full px-4 border border-white/10 flex-1 max-w-md mx-6">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input 
              type="text" 
              placeholder="Search..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm py-1"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative animate-glow rounded-full bg-black/40 border border-white/10">
              <Bell size={18} />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
