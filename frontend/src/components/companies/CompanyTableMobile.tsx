import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClickAnimation } from '@/components/ui/click-animation';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/constants';
import type { Company, Collection } from '@/lib/types';
import { getCompanyStatusDisplay } from '@/lib/company-status';

interface CompanyTableMobileProps {
  companies: Company[];
  selectedIds: number[];
  onToggleSelection: (companyId: number) => void;
  currentCollection?: Collection;
}

export function CompanyTableMobile({
  companies,
  selectedIds,
  onToggleSelection,
  currentCollection,
}: CompanyTableMobileProps) {
  return (
    <div className="md:hidden flex-1 overflow-auto p-3 space-y-2">
      {companies.map(company => {
        const isSelected = selectedIds.includes(company.id);
        const statusDisplay = getCompanyStatusDisplay(
          company,
          currentCollection
        );

        return (
          <Card
            key={company.id}
            className={cn(
              animations.colors,
              'cursor-pointer border border-gray-200/60 hover:border-gray-300/80',
              isSelected && 'ring-2 ring-primary bg-primary/5 border-primary/20'
            )}
            onClick={() => onToggleSelection(company.id)}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <ClickAnimation
                    variant="scale"
                    className="rounded px-1 py-0.5 -mx-1 -my-0.5"
                    onClick={e => {
                      e.stopPropagation();
                      onToggleSelection(company.id);
                    }}
                  >
                    <h3 className="font-medium truncate text-sm sm:text-base leading-5">
                      {company.company_name}
                    </h3>
                  </ClickAnimation>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={cn(
                        'text-xs px-2 py-0.5',
                        statusDisplay.styles
                      )}
                    >
                      {statusDisplay.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      ID: {company.id}
                    </span>
                  </div>
                </div>

                <Checkbox
                  checked={isSelected}
                  className="ml-2 mt-0.5 flex-shrink-0 w-4 h-4"
                  aria-label={`Select ${company.company_name}`}
                  onClick={e => {
                    e.stopPropagation();
                    onToggleSelection(company.id);
                  }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
