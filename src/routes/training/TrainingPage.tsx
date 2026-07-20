import { useState } from 'react'
import { SegmentedControl } from '../../components/training/SegmentedControl'
import { Today } from './Today'
import { Schedule } from './Schedule'
import { History } from './History'

type Tab = 'today' | 'schedule' | 'history'

const TABS: { value: Tab; label: string }[] = [
  { value: 'today', label: 'Idag' },
  { value: 'schedule', label: 'Schema' },
  { value: 'history', label: 'Historik' },
]

export function TrainingPage() {
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="space-y-4">
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      {tab === 'today' && <Today />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'history' && <History />}
    </div>
  )
}
