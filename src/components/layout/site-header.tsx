import { MainNav } from "./main-nav";
import { Button } from "../ui/button";
import { NavItem } from "../../types/navigation";
import { LogOut, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useOrganizations } from "@/lib/api/hooks/useOrganizations";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { supabase } from "@/lib/supabase";

interface SiteHeaderProps {
  items: NavItem[];
}

export function SiteHeader({ items }: SiteHeaderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { organizations, ownOrganization } = useOrganizations();
  const { user } = useAuth();
  const [filteredItems, setFilteredItems] = useState<NavItem[]>(items);

  // Filter navigation items based on user role and organization type
  useEffect(() => {
    // Check if the user belongs to a hiring partner organization
    const isHiringPartner = organizations?.some(
      (org) => !org.is_own_org && user?.email?.endsWith(org.email_domain || "")
    );

    // For debugging
    console.log("User email:", user?.email);
    console.log("Organizations:", organizations);
    console.log("Is hiring partner:", isHiringPartner);

    // Filter items based on role
    const filtered = items.filter((item) => {
      // If item has a role requirement, check if user meets it
      if (item.role === "hiring_partner") {
        return isHiringPartner;
      }
      return true;
    });

    setFilteredItems(filtered);
  }, [items, organizations, user]);

  // Update CSS variable for sidebar width
  document.documentElement.style.setProperty(
    "--sidebar-width",
    isCollapsed ? "80px" : "250px"
  );

  return (
    <header
      className={`fixed left-0 top-0 z-50 h-full border-r bg-[#003874] text-white transition-all duration-300 ${
        isCollapsed ? "w-[80px]" : "w-[250px]"
      }`}
    >
      <div className="flex h-14 items-center px-4 border-b border-white/10 justify-between">
        {!isCollapsed && <h1 className="text-lg font-bold">Hutech</h1>}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-white hover:bg-white/10"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <MainNav items={filteredItems} isCollapsed={isCollapsed} />
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`text-white hover:text-white hover:bg-white/10 flex items-center gap-2 ${
                  isCollapsed ? "w-full justify-center px-0" : ""
                }`}
              >
                <User className="h-5 w-5" />
                {!isCollapsed && <span>Account</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem className="text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem> */}
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={async () => {
                  await supabase.auth.signOut(); // Clears the session
                  window.location.href = "/login"; // Redirects to login page
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
