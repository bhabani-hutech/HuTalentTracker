import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";
import { NavItem } from "../../types/navigation";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface MainNavProps {
  items: NavItem[];
  isCollapsed: boolean;
}

export function MainNav({ items, isCollapsed }: MainNavProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col w-full">
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="flex flex-col py-2">
          {items?.map(
            (item) =>
              item.href && (
                <TooltipProvider key={item.href} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === item.href
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white",
                          item.disabled && "cursor-not-allowed opacity-80",
                          isCollapsed ? "justify-center px-2" : "px-4",
                        )}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        {!isCollapsed && item.title}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ),
          )}
        </div>
      </ScrollArea>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            <div className="flex flex-col py-2">
              {items?.map(
                (item) =>
                  item.href && (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
                        location.pathname === item.href
                          ? "bg-white/10 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white",
                        item.disabled && "cursor-not-allowed opacity-80",
                      )}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </Link>
                  ),
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
