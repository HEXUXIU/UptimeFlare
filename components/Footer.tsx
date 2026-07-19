import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    'Open-source monitoring and status page powered by <a href="https://github.com/lyc8503/UptimeFlare" target="_blank" style="color:rgba(255,255,255,0.7);text-decoration:underline;text-underline-offset:3px;">Uptimeflare</a>, made with ❤ by <a href="https://github.com/lyc8503" target="_blank" style="color:rgba(255,255,255,0.7);text-decoration:underline;text-underline-offset:3px;">lyc8503</a>.'

  return (
    <div
      style={{
        marginTop: '3rem',
        marginBottom: '1.5rem',
        padding: '0 1rem',
        animation: 'fadeIn 400ms var(--ease-out) 300ms both',
      }}
    >
      <div
        style={{
          maxWidth: '865px',
          margin: '0 auto',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: '1.5rem',
        }}
      >
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.45)',
            fontFamily: 'var(--wr-font-main)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            margin: 0,
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }}
        />
      </div>
    </div>
  )
}
