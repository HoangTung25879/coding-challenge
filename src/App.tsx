// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/Tooltip';
import LeadsPage from '@/pages/LeadsPage';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-xs font-bold text-white">LF</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">LeadFlow</h1>
            </header>
            <main className="mx-auto max-w-6xl px-6 py-4">
              <Routes>
                <Route path="/" element={<Navigate to="/leads" replace />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/leads/*" element={<Navigate to="/leads" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
