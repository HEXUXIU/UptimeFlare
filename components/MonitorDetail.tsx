import { Text, Tooltip } from '@mantine/core'
import { MonitorState, MonitorTarget } from '@/types/config'
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'
import DetailChart from './DetailChart'
import DetailBar from './DetailBar'
import { getColor } from '@/util/color'
import { maintenances } from '@/uptime.config'
import { useTranslation } from 'react-i18next'

export default function MonitorDetail({
  monitor,
  state,
}: {
  monitor: MonitorTarget
  state: MonitorState
}) {
  const { t } = useTranslation('common')

  if (!state.latency[monitor.id])
    return (
      <div style={{ padding: '4px 0' }}>
        <Text fw={700} style={{ fontFamily: 'var(--wr-font-main)', color: 'var(--bs-dark)' }}>
          {monitor.name}
        </Text>
        <Text fw={500} size="sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {t('No data available')}
        </Text>
      </div>
    )

  const isUp = state.incident[monitor.id].slice(-1)[0].end !== undefined
  const statusColor = isUp ? '#4ade80' : '#ef4444'

  // Hide real status icon if monitor is in maintenance
  const now = new Date()
  const hasMaintenance = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .find((maintenance) => maintenance.monitors?.includes(monitor.id))
  const finalStatusColor = hasMaintenance ? '#fab005' : statusColor

  let totalTime = Date.now() / 1000 - state.incident[monitor.id][0].start[0]
  let downTime = 0
  for (let incident of state.incident[monitor.id]) {
    downTime += (incident.end ?? Date.now() / 1000) - incident.start[0]
  }

  const uptimePercent = (((totalTime - downTime) / totalTime) * 100).toPrecision(4)

  // Conditionally render monitor name
  const monitorNameElement = (
    <Text fw={700} style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--wr-font-main)', color: 'var(--bs-dark)' }}>
      {monitor.statusPageLink ? (
        <a
          href={monitor.statusPageLink}
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'inherit',
            textDecoration: 'none',
            transition: 'color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--bs-blue)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'inherit'
          }}
        >
          {monitor.name}
        </a>
      ) : (
        <>{monitor.name}</>
      )}
    </Text>
  )

  return (
    <div style={{ padding: '4px 0' }}>
      {/* Top row: dot + name + uptime */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Status dot with glow */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: hasMaintenance ? '#fab005' : isUp ? '#4ade80' : '#ef4444',
              boxShadow: `0 0 10px ${hasMaintenance ? '#fab005' : isUp ? '#4ade80' : '#ef4444'}60`,
              animation: isUp ? 'breath 1.5s ease-in-out infinite' : 'none',
              flexShrink: 0,
            }}
          />
          <div>
            {monitor.tooltip ? (
              <Tooltip label={monitor.tooltip}>{monitorNameElement}</Tooltip>
            ) : (
              monitorNameElement
            )}
          </div>
        </div>

        <Text
          fw={700}
          style={{
            color: getColor(uptimePercent, true),
            fontFamily: 'var(--wr-font-main)',
            fontSize: '0.95rem',
          }}
        >
          {uptimePercent}%
        </Text>
      </div>

      <DetailBar monitor={monitor} state={state} />
      {!monitor.hideLatencyChart && <DetailChart monitor={monitor} state={state} />}
    </div>
  )
}
