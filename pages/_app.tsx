const U8 = Uint8Array as unknown as { fromHex?: (hex: string) => Uint8Array };
if (!U8.fromHex) {
  U8.fromHex = (hex: string) => {
    if (hex.length % 2 !== 0) throw new Error("Invalid hex length");
    const arr = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      arr[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return arr;
  };
}

import '@mantine/core/styles.css'
import type { AppProps } from 'next/app'
import { MantineProvider } from '@mantine/core'
import NoSsr from '@/components/NoSsr'
import '@/util/i18n'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSsr>
      <MantineProvider defaultColorScheme="auto">
        <Component {...pageProps} />
      </MantineProvider>
    </NoSsr>
  )
}
