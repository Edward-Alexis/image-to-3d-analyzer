import React from 'react';
import { AppProvider } from './context/AppContext';
import { ConfigProvider } from './context/ConfigContext';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DragDropZone from './components/upload/DragDropZone';
import ImagePreview from './components/upload/ImagePreview';
import AnalysisResults from './components/analysis/AnalysisResults';
// import ErrorDiagnostics from './components/analysis/ErrorDiagnostics'; // ⚠️ Movido a _unused
// import SystemStatus from './components/system/SystemStatus'; // ⚠️ Movido a _unused
// import SystemLogs from './components/system/SystemLogs'; // ⚠️ Movido a _unused
// import ConfigPanel from './components/system/ConfigPanel'; // ⚠️ Movido a _unused

function App() {
  return (
    <ConfigProvider>
      <AppProvider>
        <div className="min-h-screen bg-background text-text-primary selection:bg-primary-DEFAULT/30 selection:text-white overflow-x-hidden">
          {/* Background Ambient Effects */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-dark/20 rounded-full blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-dark/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-accent-DEFAULT/10 rounded-full blur-[100px]"></div>
          </div>

          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15, 11, 41, 0.9)',
                color: '#fff',
                border: '1px solid rgba(112, 0, 255, 0.2)',
                backdropFilter: 'blur(10px)',
              },
              success: {
                iconTheme: {
                  primary: '#00F0FF',
                  secondary: '#000',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF0055',
                  secondary: '#fff',
                },
              },
            }}
          />

          <Header />

          <main className="relative z-10 container mx-auto px-4 py-8">
            {/* <div className="mb-8 animate-slide-up">
              <SystemStatus />
            </div> */}

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Columna principal - Upload y Análisis */}
              <div className="lg:col-span-2 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <section className="glass-panel rounded-2xl p-1">
                  <DragDropZone />
                </section>

                <ImagePreview />
                {/* <ErrorDiagnostics /> */}
                <AnalysisResults />
              </div>

              {/* Columna lateral - Sistema
              <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="glass-card rounded-xl p-6 border-l-4 border-l-primary-DEFAULT">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary-DEFAULT animate-pulse"></span>
                    System Logs
                  </h3>
                  <SystemLogs />
                </div>

                <div className="glass-card rounded-xl p-6 border-l-4 border-l-accent-DEFAULT">
                  <ConfigPanel />
                </div>
              </div> */}
            </div>
          </main>

          <Footer />
        </div>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;