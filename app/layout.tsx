// app/layout.tsx
import "./globals.css";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white px-4 py-3 shadow">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <Link href="/" className="font-bold text-gray-800">Pantry Planner</Link>
            <div className="flex gap-4">
              <Link href="/calendar" className="text-gray-700 hover:text-gray-900">
                Calendar
              </Link>
              <Link href="/pantry" className="text-gray-700 hover:text-gray-900">
                Pantry
              </Link>
              <Link href="/recipes" className="text-gray-700 hover:text-gray-900">
                Recipes
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto mt-6">{children}</main>
      </body>
    </html>
  );
}
