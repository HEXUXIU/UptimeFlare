import { Container, Group, Image, Text } from '@mantine/core'
import classes from '@/styles/Header.module.css'
import { pageConfig } from '@/uptime.config'
import { PageConfigLink } from '@/types/config'
import { useTranslation } from 'react-i18next'

export default function Header({ style }: { style?: React.CSSProperties }) {
  const { t } = useTranslation('common')
  const linkToElement = (link: PageConfigLink, i: number) => {
    return (
      <a
        key={i}
        href={link.link}
        target={link.link.startsWith('/') ? undefined : '_blank'}
        className={classes.link}
        data-active={link.highlight}
      >
        {link.label}
      </a>
    )
  }

  const links = [{ label: t('Incidents'), link: '/incidents' }, ...(pageConfig.links || [])]

  return (
    <header className={classes.header} style={style}>
      <Container size="md" className={classes.inner}>
        <div className={classes.logoWrapper}>
          <a
            href={location.pathname == '/' ? 'https://github.com/lyc8503/UptimeFlare' : '/'}
            target={location.pathname == '/' ? '_blank' : undefined}
            className={classes.logoLink}
          >
            {pageConfig.logo ? (
              <Image
                src={pageConfig.logo}
                h={40}
                w={{ base: 120, sm: 160 }}
                fit="contain"
                alt="logo"
              />
            ) : (
              <div className={classes.neonLogo}>
                <span className={classes.neonText}>贺煦修</span>
                <span className={classes.neonSub}>HEXUXIU</span>
              </div>
            )}
          </a>
        </div>

        <Group gap={5} visibleFrom="sm">
          {links?.map(linkToElement)}
        </Group>

        <Group gap={5} hiddenFrom="sm">
          {links?.filter((link) => link.highlight || link.link.startsWith('/')).map(linkToElement)}
        </Group>
      </Container>
    </header>
  )
}
