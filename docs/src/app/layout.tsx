import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import 'nextra-theme-docs/style.css';
import type { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import Image from 'next/image';
import Script from "next/script";

export const metadata: Metadata = {
  title: 'Expo Release It',
  description: 'Expo CICD workflow CLI for building & uploading & submitting on your machine',
  openGraph: {
    images: 'https://expo-release-it.mjstudio.net/social-image.png',
  },
  twitter: {
    images: 'https://expo-release-it.mjstudio.net/social-image.png',
  },
};

const navbar = (
  <Navbar
    logo={
      <div className={'flex items-center'}>
        <Image src={'/logo.svg'} alt={'logo'} width={40} height={40} className={'dark:invert'} />
        <b>Expo Release It</b>
      </div>
    }
    projectLink={'https://github.com/mym0404/expo-release-it'}
    // ... Your additional navbar options
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © MJ Studio.</Footer>;

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Script defer src="https://umami.mjstudio.net/script.js" data-website-id="a82633cc-1420-405e-9f7d-803c4c7ca47e"/>
      <Head
      // ... Your additional head options
      >
        <Script defer src="https://umami.mjstudio.net/script.js" data-website-id="a82633cc-1420-405e-9f7d-803c4c7ca47e"></Script>
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/mym0404/expo-release-it/tree/main/docs"
          footer={footer}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
