import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Package, 
  Container, 
  ScanLine, 
  DollarSign, 
  Menu,
  Hexagon,
  TrendingUp
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/materials", label: "Materials", icon: Container },
  { href: "/scan", label: "Smart Scan", icon: ScanLine },
  { href: "/sales", label: "Sales", icon: DollarSign },
  { href: "/analytics", label: "AI Analytics", icon: TrendingUp },
];

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Hexagon className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight">AssetFlow</h1>
            <span className="text-xs text-muted-foreground font-mono">v2.4.0-IND</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground mb-4 px-2 uppercase tracking-wider">
          System Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent/50 rounded-lg p-3 border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-sidebar-foreground">System Online</span>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            Vision Engine: Connected<br/>
            DB Latency: 24ms
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <NavContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 md:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 sticky top-0 z-20">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <span className="ml-3 font-semibold">VisionFlow Inventory</span>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
