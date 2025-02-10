export function SiteFooter() {
  return (
    <footer className="fixed bottom-0 right-0 z-40 w-[calc(100%-var(--sidebar-width))] border-t bg-background transition-all duration-300">
      <div className="container flex h-14 items-center justify-between text-sm">
        <span>
          © {new Date().getFullYear()} Hutech Solutions. All rights reserved.
        </span>
        <div className="flex items-center gap-4">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Privacy Policy
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
