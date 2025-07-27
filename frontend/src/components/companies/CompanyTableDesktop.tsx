import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ClickAnimation } from '@/components/ui/click-animation';
import { cn } from '@/lib/utils';
import { animations } from '@/lib/constants';
import type { Company } from '@/lib/types';

interface CompanyTableDesktopProps {
  companies: Company[];
  selectedIds: number[];
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelection: (
    company: Company,
    index: number,
    event: React.MouseEvent
  ) => void;
}

export function CompanyTableDesktop({
  companies,
  selectedIds,
  isAllSelected,
  isPartiallySelected,
  onToggleSelectAll,
  onToggleSelection,
}: CompanyTableDesktopProps) {
  return (
    <div role="region" aria-label="Company data table" className="w-full">
      <Table>
        <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 border-b border-gray-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-16 py-4 pl-6 pr-3">
              <Checkbox
                checked={isPartiallySelected ? 'indeterminate' : isAllSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label={
                  isAllSelected
                    ? 'Unselect all companies'
                    : `Select all ${companies.length} companies`
                }
                className="border-gray-300"
              />
            </TableHead>
            <TableHead className="py-4 px-4 text-left font-semibold text-gray-900">
              Company Name
            </TableHead>
            <TableHead className="py-4 px-4 text-left font-semibold text-gray-900">
              Status
            </TableHead>
            <TableHead className="py-4 pl-4 pr-6 text-right font-semibold text-gray-900">
              ID
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {companies.map((company, index) => {
            const isSelected = selectedIds.includes(company.id);

            return (
              <TableRow
                key={company.id}
                className={cn(
                  'group cursor-pointer border-b border-gray-100',
                  animations.colors,
                  'hover:bg-blue-50/60',
                  isSelected && 'bg-blue-50/80 border-blue-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                )}
                onClick={e => onToggleSelection(company, index, e)}
                tabIndex={0}
                aria-selected={isSelected}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const syntheticEvent = {
                      shiftKey: e.shiftKey,
                    } as React.MouseEvent;
                    onToggleSelection(company, index, syntheticEvent);
                  }
                }}
                style={{
                  animationDelay: `${index * 20}ms`,
                }}
              >
                <TableCell className="py-4 pl-6 pr-3">
                  <Checkbox
                    checked={isSelected}
                    tabIndex={-1}
                    aria-label={`Select ${company.company_name}`}
                    className={cn(
                      animations.transform,
                      isSelected && 'scale-110',
                      'border-gray-300 cursor-pointer'
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleSelection(company, index, e);
                    }}
                  />
                </TableCell>

                <TableCell className="py-4 px-4">
                  <ClickAnimation
                    variant="ripple"
                    className={cn(
                      animations.transform,
                      'group-hover:translate-x-1 rounded px-2 py-1 -mx-2 -my-1'
                    )}
                    onClick={e => {
                      e.stopPropagation();
                      onToggleSelection(company, index, e);
                    }}
                  >
                    <p className="font-medium text-gray-900">
                      {company.company_name}
                    </p>
                  </ClickAnimation>
                </TableCell>

                <TableCell className="py-4 px-4">
                  <Badge
                    variant={company.liked ? 'default' : 'secondary'}
                    className={cn(
                      animations.colors,
                      company.liked
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                    )}
                  >
                    {company.liked ? 'Liked' : 'Unlisted'}
                  </Badge>
                </TableCell>

                <TableCell className="py-4 pl-4 pr-6 text-right text-gray-600 font-mono text-sm">
                  {company.id}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
