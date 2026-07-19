import { MaintenanceConfig, MonitorTarget } from '@/types/config'
import { Center, Container, Title, Collapse, Button, Box, Card, Text } from '@mantine/core'
import { IconCircleCheck, IconAlertCircle, IconPlus, IconMinus } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import MaintenanceAlert from './MaintenanceAlert'
import { pageConfig } from '@/uptime.config'
import { useTranslation } from 'react-i18next'

function useWindowVisibility() {
  const [isVisible, setIsVisible] = useState(true)
  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])
  return isVisible
}

export default function OverallStatus({
  state,
  maintenances,
  monitors,
}: {
  state: { overallUp: number; overallDown: number; lastUpdate: number }
  maintenances: MaintenanceConfig[]
  monitors: MonitorTarget[]
}) {
  const { t } = useTranslation('common')
  let group = pageConfig.group
  let groupedMonitor = (group && Object.keys(group).length > 0) || false

  let statusString = ''
  let statusSubtext = ''
  let isAllUp = false
  let isAllDown = false

  if (state.overallUp === 0 && state.overallDown === 0) {
    statusString = t('No data yet')
    statusSubtext = t('Waiting for first check...')
  } else if (state.overallUp === 0) {
    statusString = t('All systems down')
    statusSubtext = t('We are investigating')
    isAllDown = true
  } else if (state.overallDown === 0) {
    statusString = t('All systems operational')
    statusSubtext = t('Everything is running smoothly')
    isAllUp = true
  } else {
    statusString = t('Some systems not operational')
    statusSubtext = t('{down} of {total} services experiencing issues', {
      down: state.overallDown,
      total: state.overallUp + state.overallDown,
    })
  }

  const [openTime] = useState(Math.round(Date.now() / 1000))
  const [currentTime, setCurrentTime] = useState(Math.round(Date.now() / 1000))
  const isWindowVisible = useWindowVisibility()
  const [expandUpcoming, setExpandUpcoming] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isWindowVisible) return
      if (currentTime - state.lastUpdate > 300 && currentTime - openTime > 30) {
        window.location.reload()
      }
      setCurrentTime(Math.round(Date.now() / 1000))
    }, 1000)
    return () => clearInterval(interval)
  })

  const now = new Date()

  const activeMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: MonitorTarget[]
  })[] = maintenances
    .filter((m) => now >= new Date(m.start) && (!m.end || now <= new Date(m.end)))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const upcomingMaintenances: (Omit<MaintenanceConfig, 'monitors'> & {
    monitors?: (MonitorTarget | undefined)[]
  })[] = maintenances
    .filter((m) => now < new Date(m.start))
    .map((maintenance) => ({
      ...maintenance,
      monitors: maintenance.monitors?.map(
        (monitorId) => monitors.find((mon) => monitorId === mon.id)!
      ),
    }))

  const statusColor = isAllUp ? '#4ade80' : isAllDown ? '#ef4444' : '#fbbf24'

  return (
    <Container size="md" mt="xl">
      <Card
        padding="xl"
        radius="md"
        style={{
          textAlign: 'center',
          animation: 'scaleIn 300ms var(--ease-out) both',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${statusColor}, transparent)`,
            opacity: 0.8,
          }}
        />

        {/* Status indicator dot */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: statusColor,
            boxShadow: `0 0 20px ${statusColor}40`,
            marginBottom: 12,
            animation: 'breath 1.5s ease-in-out infinite',
          }}
        />

        <Title
          style={{
            fontFamily: 'var(--wr-font-title)',
            fontWeight: 900,
            fontSize: '2rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            textShadow: '0 0 14px rgba(255,255,255,0.12), 0 8px 24px rgba(0,0,0,0.72)',
            color: statusColor,
            animation: 'fadeInUp 300ms var(--ease-out) 100ms both',
          }}
          order={2}
        >
          {statusString}
        </Title>

        <Text
          size="lg"
          mt="xs"
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--wr-font-main)',
            fontWeight: 500,
            animation: 'fadeIn 300ms var(--ease-out) 200ms both',
          }}
        >
          {statusSubtext}
        </Text>

        <Text
          size="sm"
          mt="md"
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'var(--wr-font-main)',
            fontSize: '0.85rem',
            animation: 'fadeIn 300ms var(--ease-out) 300ms both',
          }}
        >
          {t('Last updated on', {
            date: new Date(state.lastUpdate * 1000).toLocaleString(),
            seconds: currentTime - state.lastUpdate,
          })}
        </Text>
      </Card>

      {/* Upcoming Maintenance */}
      {upcomingMaintenances.length > 0 && (
        <Card padding="md" radius="md" mt="md" style={{ animation: 'fadeInUp 300ms var(--ease-out) 300ms both' }}>
          <Text
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'var(--wr-font-title)',
              fontSize: '0.9rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {t('upcoming maintenance', { count: upcomingMaintenances.length })}{' '}
            <span
              style={{
                textDecoration: 'underline',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                transition: 'opacity var(--duration-fast) var(--ease-out)',
              }}
              onClick={() => setExpandUpcoming(!expandUpcoming)}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {expandUpcoming ? t('Hide') : t('Show')}
            </span>
          </Text>

          <Collapse in={expandUpcoming}>
            {upcomingMaintenances.map((maintenance, idx) => (
              <MaintenanceAlert
                key={`upcoming-${idx}`}
                maintenance={maintenance}
                style={{ maxWidth: groupedMonitor ? '897px' : '865px' }}
                upcoming
              />
            ))}
          </Collapse>
        </Card>
      )}

      {/* Active Maintenance */}
      {activeMaintenances.map((maintenance, idx) => (
        <div key={`active-${idx}`} style={{ animation: `fadeInUp 300ms var(--ease-out) ${400 + idx * 50}ms both` }}>
          <MaintenanceAlert
            maintenance={maintenance}
            style={{ maxWidth: groupedMonitor ? '897px' : '865px', marginTop: '16px' }}
          />
        </div>
      ))}
    </Container>
  )
}
