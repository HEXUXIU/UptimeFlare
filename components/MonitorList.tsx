import { MonitorState, MonitorTarget } from '@/types/config'
import { Accordion, Card, Center, Text } from '@mantine/core'
import MonitorDetail from './MonitorDetail'
import { pageConfig } from '@/uptime.config'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function countDownCount(state: MonitorState, ids: string[]) {
  let downCount = 0
  for (let id of ids) {
    if (state.incident[id] === undefined || state.incident[id].length === 0) {
      continue
    }

    if (state.incident[id].slice(-1)[0].end === undefined) {
      downCount++
    }
  }
  return downCount
}

function getStatusColor(state: MonitorState, ids: string[]) {
  let downCount = countDownCount(state, ids)
  if (downCount === 0) return '#4ade80'
  if (downCount === ids.length) return '#ef4444'
  return '#fbbf24'
}

export default function MonitorList({
  monitors,
  state,
}: {
  monitors: MonitorTarget[]
  state: MonitorState
}) {
  const { t } = useTranslation('common')
  const group = pageConfig.group
  const groupedMonitor = group && Object.keys(group).length > 0
  let content

  // Load expanded groups from localStorage
  const savedExpandedGroups = localStorage.getItem('expandedGroups')
  const expandedInitial = savedExpandedGroups
    ? JSON.parse(savedExpandedGroups)
    : Object.keys(group || {})
  const [expandedGroups, setExpandedGroups] = useState<string[]>(expandedInitial)
  useEffect(() => {
    localStorage.setItem('expandedGroups', JSON.stringify(expandedGroups))
  }, [expandedGroups])

  // Stagger animation for monitor items
  const staggerStyle = (index: number): React.CSSProperties => ({
    animation: `fadeInUp 300ms var(--ease-out) ${index * 50}ms both`,
  })

  if (groupedMonitor) {
    // Grouped monitors with glassmorphism style
    content = (
      <Accordion
        multiple
        defaultValue={Object.keys(group)}
        variant="contained"
        value={expandedGroups}
        onChange={(values) => setExpandedGroups(values)}
        transitionDuration={250}
        styles={{
          item: {
            background: 'transparent',
            border: 'none',
            marginBottom: '8px',
          },
          control: {
            borderRadius: '12px',
            transition: 'background 0.2s ease',
          },
          panel: {
            background: 'transparent',
          },
        }}
      >
        {Object.keys(group).map((groupName, gi) => {
          const statusColor = getStatusColor(state, group[groupName])
          return (
            <Accordion.Item key={groupName} value={groupName}>
              <Accordion.Control>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'var(--wr-font-title)',
                      fontSize: '1.4rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--bs-dark)',
                      textShadow: '0 0 10px rgba(255,255,255,0.08), 0 4px 14px rgba(0,0,0,0.62)',
                    }}
                  >
                    {groupName}
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {/* Status dot */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: statusColor,
                        boxShadow: `0 0 8px ${statusColor}60`,
                      }}
                    />
                    <Text
                      fw={600}
                      style={{
                        color: statusColor,
                        fontFamily: 'var(--wr-font-main)',
                        fontSize: '0.95rem',
                      }}
                    >
                      {group[groupName].length - countDownCount(state, group[groupName])}/
                      {group[groupName].length} {t('Operational')}
                    </Text>
                  </div>
                </div>
              </Accordion.Control>
              <Accordion.Panel>
                {monitors
                  .filter((monitor) => group[groupName].includes(monitor.id))
                  .sort((a, b) => group[groupName].indexOf(a.id) - group[groupName].indexOf(b.id))
                  .map((monitor) => (
                    <div key={monitor.id}>
                      <Card.Section ml="xs" mr="xs">
                        <MonitorDetail monitor={monitor} state={state} />
                      </Card.Section>
                    </div>
                  ))}
              </Accordion.Panel>
            </Accordion.Item>
          )
        })}
      </Accordion>
    )
  } else {
    // Ungrouped monitors — grid layout with stagger
    content = (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 14,
        }}
      >
        {monitors.map((monitor, index) => (
          <div
            key={monitor.id}
            style={{
              ...staggerStyle(index),
              background: 'var(--wr-glass-bg-light)',
              border: 'var(--wr-glass-border)',
              borderRadius: 13,
              boxShadow: 'var(--wr-shadow-small), var(--wr-inner-glow)',
              backdropFilter: 'blur(12px) saturate(140%)',
              WebkitBackdropFilter: 'blur(12px) saturate(140%)',
              padding: '12px 14px',
              transition: 'background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease',
            }}
            className="monitor-item-card"
          >
            <MonitorDetail monitor={monitor} state={state} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Center>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        ml="md"
        mr="md"
        mt="xl"
        withBorder={false}
        style={{
          width: '100%',
          maxWidth: groupedMonitor ? '900px' : '1100px',
        }}
      >
        {content}
      </Card>
    </Center>
  )
}
