import Navbar from './Navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] bg-grid">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>}
            {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
