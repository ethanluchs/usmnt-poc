import './globals.css'
import AuthProvider from '../components/AuthProvider'

export const metadata = {
  title: 'Trailblazer',
  description: 'Guess the USMNT player from their career stops',
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
