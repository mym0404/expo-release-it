import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import 'nextra-theme-docs/style.css';
import type { ReactNode } from 'react';
import './globals.css';
import type { Metadata } from 'next';
import Image from 'next/image';

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
      <Head
      // ... Your additional head options
      >
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
