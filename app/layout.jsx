import './globals.css'

export const metadata = {
  title: 'Trailblazer',
  description: 'Guess the USMNT player from their career stops',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
