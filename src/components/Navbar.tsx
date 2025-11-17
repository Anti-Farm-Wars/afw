import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Users, LogIn, Trophy, Scale } from "lucide-react";
import logo from "@/assets/afw-logo.png";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="AFW" className="h-12 w-12 transition-transform group-hover:scale-110" />
            <span className="font-bold text-xl text-foreground">AFW</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link to="/clan-lookup">
              <Button 
                variant={isActive("/clan-lookup") ? "default" : "ghost"}
                className="gap-2"
              >
                <Shield className="h-4 w-4" />
                Clan Lookup
              </Button>
            </Link>
            
            <Link to="/clan-cwl">
              <Button 
                variant={isActive("/clan-cwl") ? "default" : "ghost"}
                className="gap-2"
              >
                <Trophy className="h-4 w-4" />
                CWL Lookup
              </Button>
            </Link>
            
            <Link to="/player-lookup">
              <Button 
                variant={isActive("/player-lookup") ? "default" : "ghost"}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Player Lookup
              </Button>
            </Link>
            
            <Link to="/war-weight">
              <Button 
                variant={isActive("/war-weight") ? "default" : "ghost"}
                className="gap-2"
              >
                <Scale className="h-4 w-4" />
                War Weight
              </Button>
            </Link>
            
            <Link to="/staff">
              <Button 
                variant="outline"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
