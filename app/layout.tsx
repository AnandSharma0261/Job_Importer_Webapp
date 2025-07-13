export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Job Prompter Admin</title>
        <meta name="description" content="Simple Job Import Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { 
            font-family: Arial, sans-serif; 
            background-color: #f5f5f5; 
            color: #333; 
            line-height: 1.6; 
          }
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          button:hover { 
            opacity: 0.9; 
            transform: translateY(-1px); 
            transition: all 0.2s ease; 
          }
          table tbody tr:hover { 
            background-color: #f8f9fa; 
          }
          input:focus, select:focus { 
            outline: none; 
            border-color: #007bff; 
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); 
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
