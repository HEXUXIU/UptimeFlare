import { Divider } from '@mantine/core'
import { pageConfig } from '@/uptime.config'

export default function Footer() {
  const defaultFooter =
    '<p style="text-align: center; font-size: 12px; margin-top: 10px;"> Open-source monitoring and status page powered by <a href="https://github.com/lyc8503/UptimeFlare" target="_blank">Uptimeflare</a>, made with ❤ by <a href="https://github.com/lyc8503" target="_blank">lyc8503</a>. </p>'

  return (
    <>
      <Divider
        mt="lg"
        style={{
          transition: 'border-color var(--duration-normal) var(--ease-out)',
        }}
      />
      <div
        style={{
          animation: 'fadeIn 400ms var(--ease-out) 300ms both',
        }}
        dangerouslySetInnerHTML={{ __html: pageConfig.customFooter ?? defaultFooter }}
      />
    </>
  )
}
