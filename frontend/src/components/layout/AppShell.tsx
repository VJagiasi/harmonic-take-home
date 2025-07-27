import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { CollectionsSidebar } from '@/components/collections/CollectionsSidebar';
import { cn } from '@/lib/utils';
import type { Collection } from '@/lib/types';

interface AppShellProps {
  children: React.ReactNode;
  collections: Collection[];
  selectedCollection?: Collection | null;
  onCollectionSelect: (collection: Collection) => void;
}

export function AppShell({
  children,
  collections,
  selectedCollection,
  onCollectionSelect,
}: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(
    () => {
      // Load from localStorage on initial render
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved === 'true';
      }
      return false;
    }
  );

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(
      'sidebarCollapsed',
      isDesktopSidebarCollapsed.toString()
    );
  }, [isDesktopSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      <div className="lg:flex lg:h-screen">
        {/* Mobile drawer for collections */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[280px] sm:w-80 p-0 overflow-y-auto"
          >
            <SheetTitle className="sr-only">Collections Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between different company collections
            </SheetDescription>
            <CollectionsSidebar
              collections={collections}
              selectedCollection={selectedCollection}
              onCollectionSelect={collection => {
                onCollectionSelect(collection);
                setIsMobileSidebarOpen(false);
              }}
            />
          </SheetContent>
        </Sheet>

        {/* Desktop: Collapsible sidebar */}
        <aside
          role="navigation"
          aria-label="Collections navigation"
          className={cn(
            'hidden lg:flex lg:border-r lg:bg-muted/10 lg:flex-col lg:overflow-y-auto transition-all duration-300 ease-out',
            isDesktopSidebarCollapsed ? 'lg:w-16' : 'lg:w-80 xl:w-96'
          )}
        >
          <CollectionsSidebar
            collections={collections}
            selectedCollection={selectedCollection}
            onCollectionSelect={onCollectionSelect}
            isCollapsed={isDesktopSidebarCollapsed}
            onToggleCollapse={() =>
              setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)
            }
          />
        </aside>

        {/* Main content area */}
        <main
          id="main-content"
          role="main"
          className="flex-1 flex flex-col min-h-screen bg-slate-50/50"
        >
          {/* Mobile header with menu toggle */}
          <header className="lg:hidden border-b bg-background/95 backdrop-blur px-3 sm:px-4 py-3 sticky top-0 z-40">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open collections menu"
                className="flex-shrink-0"
              >
                <Menu className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Collections</span>
                <span className="xs:hidden">Menu</span>
              </Button>

              {selectedCollection && (
                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs truncate max-w-[140px] sm:max-w-none"
                  title={selectedCollection.collection_name}
                >
                  {selectedCollection.collection_name}
                </Badge>
              )}
            </div>
          </header>

          {/* Main content container with dynamic width */}
          <div
            className={cn(
              'flex-1 transition-all duration-300 ease-out',
              isDesktopSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
            )}
          >
            <div className="max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
              <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200/60">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
