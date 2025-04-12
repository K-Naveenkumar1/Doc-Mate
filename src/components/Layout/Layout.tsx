
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import SideNav from "./SideNav";
import { Progress } from "@/components/UI/progress";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  // Simulate loading on route change
  useEffect(() => {
    setIsLoading(true);
    setProgress(0);
    
    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(60), 200);
    const timer3 = setTimeout(() => setProgress(90), 300);
    const timer4 = setTimeout(() => {
      setProgress(100);
      const finalTimer = setTimeout(() => setIsLoading(false), 200);
      return () => clearTimeout(finalTimer);
    }, 400);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Progress value={progress} className="h-1" />
        </div>
      )}
      <Header />
      <div className="flex flex-1 relative">
        <SideNav />
        <main className="flex-1 pt-16 md:pl-64 min-h-screen overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
