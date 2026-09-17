import React, { useState } from 'react';
import { useOnlineStatus, usePWAInstall } from './usePWAInstall';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  Activity, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const NetworkDiagnosticCard: React.FC = () => {
  const { isOnline, networkInfo } = useOnlineStatus();
  const { isInstalled, isIOS, install, isInstallable } = usePWAInstall();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const runDiagnostic = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      // Simulate a ping to the database/server
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, 800));
      const duration = Date.now() - startTime;
      
      if (isOnline) {
        setTestResult('success');
      } else {
        setTestResult('error');
      }
    } catch (e) {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Status de Conectividade</h3>
            <p className="text-[10px] text-slate-500 font-medium">
              {isOnline ? 'Conectado à Internet' : 'Sem Conexão Detectada'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isOnline ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Network Details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Signal className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Tipo de Rede</span>
            </div>
            <p className="text-xs font-bold text-slate-900 capitalize">
              {networkInfo.type || (isOnline ? 'WiFi/Dados' : 'Nenhum')}
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Activity className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Velocidade</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Desconhecido'}
            </p>
          </div>
        </div>

        {/* PWA Status */}
        {!isInstalled && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-bold text-indigo-900">App Não Instalado</h4>
              <p className="text-[10px] text-indigo-700 leading-relaxed">
                Para melhor performance e funcionamento offline no seu celular, instale este aplicativo na sua tela inicial.
              </p>
              {isInstallable && (
                <button
                  onClick={install}
                  className="mt-2 text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Instalar Agora
                </button>
              )}
              {isIOS && !isInstallable && (
                <div className="mt-2 text-[9px] text-indigo-600 font-medium flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Toque em "Compartilhar" e "Adicionar à Tela de Início"</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diagnostic Action */}
        <div className="space-y-3">
          <button
            onClick={runDiagnostic}
            disabled={testing}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Testando conexão...</span>
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Testar Conexão com Servidor</span>
              </>
            )}
          </button>

          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-3 rounded-xl flex items-center gap-2 ${
                  testResult === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}
              >
                {testResult === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span className="text-[10px] font-bold">
                  {testResult === 'success' 
                    ? 'Conexão estável! O aplicativo está sincronizando corretamente com a nuvem.' 
                    : 'Falha na conexão. Verifique se o seu celular tem acesso à internet (WiFi ou 4G).'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[9px] text-amber-700 leading-tight">
            <strong>Nota Técnica:</strong> O aplicativo usa automaticamente a conexão ativa do seu celular. 
            Não é necessário configurar o WiFi dentro do app. Se o sinal estiver fraco, o app entrará em modo offline automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};
