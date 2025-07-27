import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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
import type { Company, Collection } from '@/lib/types';
import { getCompanyStatusDisplay } from '@/lib/company-status';

interface DraggableCompanyTableProps {
  companies: Company[];
  selectedIds: number[];
  isAllSelected: boolean;
  onToggleSelectAll: () => void;
  onToggleSelection: (
    company: Company,
    index: number,
    event: React.MouseEvent
  ) => void;
  onReorderCompanies: (companies: Company[]) => void;
  currentCollection?: Collection;
}

interface SortableRowProps {
  company: Company;
  index: number;
  isSelected: boolean;
  onToggleSelection: (
    company: Company,
    index: number,
    event: React.MouseEvent
  ) => void;
  currentCollection?: Collection;
}

function SortableRow({
  company,
  index,
  isSelected,
  onToggleSelection,
  currentCollection,
}: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({ id: company.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const statusDisplay = getCompanyStatusDisplay(company, currentCollection);

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        'group border-gray-100',
        animations.colors,
        'hover:bg-gray-50/80',
        isSelected && 'bg-blue-50/50 hover:bg-blue-50/80',
        isCurrentlyDragging && 'opacity-50 scale-105 shadow-lg z-50',
        'cursor-pointer',
        !isCurrentlyDragging && animations.transform
      )}
      onClick={e => {
        if (!isCurrentlyDragging) {
          onToggleSelection(company, index, e);
        }
      }}
    >
      <TableCell className="w-8 pl-2 pr-1">
        <div
          {...attributes}
          {...listeners}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing',
            animations.dragHandle,
            animations.hoverSubtle,
            'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
          )}
          onClick={e => e.stopPropagation()}
          role="button"
          aria-label={`Drag to reorder ${company.company_name}`}
          tabIndex={0}
        >
          <GripVertical className="w-3 h-3" />
        </div>
      </TableCell>

      <TableCell className="w-12 pl-1 pr-2">
        <Checkbox
          checked={isSelected}
          aria-label={`Select ${company.company_name}`}
          className={cn(
            'border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900',
            animations.transform,
            isSelected && 'scale-110',
            'cursor-pointer'
          )}
          tabIndex={-1}
          onClick={e => {
            e.stopPropagation();
            onToggleSelection(company, index, e);
          }}
        />
      </TableCell>

      {/* Company Name */}
      <TableCell className="font-medium text-gray-900 py-3">
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
          {company.company_name}
        </ClickAnimation>
      </TableCell>

      <TableCell
        className="py-3 w-24 cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          onToggleSelection(company, index, e);
        }}
      >
        <Badge
          variant="secondary"
          className={cn(
            'text-xs font-medium pointer-events-none',
            animations.colors,
            statusDisplay.styles
          )}
        >
          {statusDisplay.label}
        </Badge>
      </TableCell>

      <TableCell
        className="py-3 text-right text-gray-500 font-mono text-sm pr-4 cursor-pointer"
        onClick={e => {
          e.stopPropagation();
          onToggleSelection(company, index, e);
        }}
      >
        {company.id}
      </TableCell>
    </TableRow>
  );
}

export function DraggableCompanyTable({
  companies,
  selectedIds,
  isAllSelected,
  onToggleSelectAll,
  onToggleSelection,
  onReorderCompanies,
  currentCollection,
}: DraggableCompanyTableProps) {
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [localCompanies, setLocalCompanies] = useState(companies);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  const isPartiallySelected =
    selectedIds.length > 0 && selectedIds.length < companies.length;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);

    const draggedCompany = localCompanies.find(c => c.id === active.id);
    if (draggedCompany) {
      setAnnouncement(`Started dragging ${draggedCompany.company_name}`);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id && over) {
      const oldIndex = localCompanies.findIndex(
        company => company.id === active.id
      );
      const newIndex = localCompanies.findIndex(
        company => company.id === over.id
      );

      const newOrder = arrayMove(localCompanies, oldIndex, newIndex);
      setLocalCompanies(newOrder);
      onReorderCompanies(newOrder);

      const draggedCompany = localCompanies.find(c => c.id === active.id);
      if (draggedCompany) {
        setAnnouncement(
          `${draggedCompany.company_name} moved to position ${newIndex + 1}`
        );
      }
    } else {
      const draggedCompany = localCompanies.find(c => c.id === active.id);
      if (draggedCompany) {
        setAnnouncement(
          `${draggedCompany.company_name} returned to original position`
        );
      }
    }

    setActiveId(null);
    setTimeout(() => setAnnouncement(''), 3000);
  }

  const activeCompany = localCompanies.find(company => company.id === activeId);
  const activeStatusDisplay = activeCompany
    ? getCompanyStatusDisplay(activeCompany, currentCollection)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader className="sticky top-0 bg-white/90 backdrop-blur-sm z-20 border-b border-gray-200">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-8 pl-2 pr-1"></TableHead>

            <TableHead className="w-12 pl-1 pr-2">
              <Checkbox
                checked={isAllSelected}
                ref={(input: HTMLButtonElement | null) => {
                  if (input) {
                    const checkboxInput = input as HTMLInputElement;
                    checkboxInput.indeterminate = isPartiallySelected;
                  }
                }}
                onCheckedChange={onToggleSelectAll}
                aria-label={
                  isAllSelected
                    ? 'Deselect all companies'
                    : isPartiallySelected
                      ? 'Select all companies'
                      : 'Select all companies'
                }
                className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
              />
            </TableHead>

            {/* Company Name */}
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-4">
              Company Name
            </TableHead>

            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-24 py-4">
              Status
            </TableHead>

            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-16 text-right pr-4 py-4">
              ID
            </TableHead>
          </TableRow>
        </TableHeader>

        <SortableContext
          items={localCompanies.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <TableBody>
            {localCompanies.map((company, index) => {
              const isSelected = selectedIds.includes(company.id);

              return (
                <SortableRow
                  key={company.id}
                  company={company}
                  index={index}
                  isSelected={isSelected}
                  onToggleSelection={onToggleSelection}
                  currentCollection={currentCollection}
                />
              );
            })}
          </TableBody>
        </SortableContext>
      </Table>

      <DragOverlay>
        {activeCompany ? (
          <div
            className={cn(
              'border border-gray-200 rounded-lg p-3 min-w-[300px]',
              animations.dragOverlay
            )}
          >
            <div className="flex items-center space-x-3">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {activeCompany.company_name}
                </p>
                <p className="text-sm text-gray-500">ID: {activeCompany.id}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn('text-xs', activeStatusDisplay?.styles)}
              >
                {activeStatusDisplay?.label}
              </Badge>
            </div>
          </div>
        ) : null}
      </DragOverlay>

      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </DndContext>
  );
}
