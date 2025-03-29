import "./globals.css";
import "./login.css";
import "./landing.css";
import "./operators.css";
import "./map.css";
import "./sidebar.css";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "Crane Monitor",
  description: "Industrial Crane Monitoring System",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

import "./globals.css";
