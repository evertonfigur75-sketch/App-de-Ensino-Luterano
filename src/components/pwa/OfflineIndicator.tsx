import React from 'react';
import { useOnlineStatus } from './usePWAInstall';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="banner-offline"
      className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 rounded-xl bg-amber-900 text-amber-50 px-4 py-2.5 text-xs font-medium shadow-xl border border-amber-700/50 backdrop-blur-md animate-bounce"
    >
      <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
      <div>
        <span className="font-bold">Modo Offline Ativo:</span> Os dados locais e o Catecismo continuam disponíveis para consulta.
      </div>
    </div>
  );
};
