// components/ui/SpecsGrid.tsx

import { ProjectSpecs } from '@/lib/types'

interface SpecsGridProps {
  specs: ProjectSpecs
  designTeam?: string[] | null
  executionTeam?: string[] | null
}

const SPEC_FIELDS: { key: keyof ProjectSpecs; label: string }[] = [
  { key: 'address',    label: 'Address' },
  { key: 'floors',     label: 'Floors' },
  { key: 'structure',  label: 'Structure' },
  { key: 'total_area', label: 'Total area' },
  { key: 'units',      label: 'Number of apartments' },
  { key: 'parking',    label: 'Underground parking' },
  { key: 'completion', label: 'Completion' },
  { key: 'budget',     label: 'Budget' },
  { key: 'developer',  label: 'Developer' },
  { key: 'programme',  label: 'Programme' },
  { key: 'mep',        label: 'Structure and MEP' },
  { key: 'photos_by',  label: 'Photos' },
]

export default function SpecsGrid({ specs, designTeam, executionTeam }: SpecsGridProps) {
  const activeSpecs = SPEC_FIELDS.filter((f) => specs[f.key])
  const hasTeams =
    (designTeam && designTeam.length > 0) ||
    (executionTeam && executionTeam.length > 0)

  if (activeSpecs.length === 0 && !hasTeams) return null

  return (
    <div className="mt-12">
      {/* ── 2-column spec table at all screen sizes ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {activeSpecs.map(({ key, label }) => (
          <div key={key}>
            <div className="text-body-sm text-muted mb-1">{label}</div>
            <div className="text-body">{specs[key]}</div>
          </div>
        ))}
      </div>

      {/* ── Design / execution teams ── */}
      {hasTeams && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t border-border">
          {designTeam && designTeam.length > 0 && (
            <div>
              <div className="text-body-sm text-muted mb-1">Design team</div>
              <div className="text-body">{designTeam.join(', ')}</div>
            </div>
          )}
          {executionTeam && executionTeam.length > 0 && (
            <div>
              <div className="text-body-sm text-muted mb-1">Execution team</div>
              <div className="text-body">{executionTeam.join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}