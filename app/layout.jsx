import './globals.css'
import AuthProvider from '../components/AuthProvider'

export const metadata = {
  title: 'Wordle Cup',
  description: 'Guess the World Cup 2026 player from their career stops',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
