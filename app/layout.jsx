import './globals.css'
import AuthProvider from '../components/AuthProvider'

export const metadata = {
  title: 'Wordle Cup',
  description: 'Guess the World Cup 2026 player from their career stops',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}` }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
