import React, { useState, useEffect } from 'react';
import { Key, Check, ExternalLink, X, ShieldCheck, Sparkles } from 'lucide-react';
import { saveApiKey, removeStoredApiKey, getStoredApiKey, getStoredModel, saveStoredModel } from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
  theme?: 'dark' | 'light';
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
  theme = 'dark'
}) => {
  const currentKey = getStoredApiKey();
  const [apiKeyInput, setApiKeyInput] = useState(currentKey);
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(getStoredApiKey());
      setSelectedModel(getStoredModel());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim());
      saveStoredModel(selectedModel);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onKeySaved();
        onClose();
      }, 700);
    }
  };

  const handleClear = () => {
    removeStoredApiKey();
    setApiKeyInput('');
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-900'} border rounded-2xl max-w-md w-full p-6 shadow-2xl relative`}>
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#8CC63F]">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              Configuración de Gemini API
              {Boolean(currentKey) && (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3" /> Activa
                </span>
              )}
            </h3>
            <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Comunicación Global • Cliente Directo</span>
          </div>
        </div>

        <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Configura tu API Key de Gemini y el modelo preferido. Se almacena de forma segura en tu navegador (<code className="text-[#8CC63F] font-mono">localStorage</code>) para llamadas directas y limpias sin errores de servidor.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Google AI Studio API Key:
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy... o tu clave de API"
              className={`w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:border-[#8CC63F] transition ${
                isDark ? 'bg-slate-950 border-slate-700 text-cyan-300' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              autoFocus
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Modelo de Gemini:
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:border-[#8CC63F] transition ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="gemini-2.5-flash">gemini-2.5-flash (Recomendado: 1,500 req/día gratis, sin límite de 20)</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
              <option value="gemini-3.8-flash">gemini-3.8-flash</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[#8CC63F] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Obtener API Key en Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {currentKey && (
              <button
                onClick={handleClear}
                className="text-rose-400 hover:underline font-medium"
              >
                Eliminar llave guardada
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'}`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKeyInput.trim()}
            className="px-4 py-2 rounded-lg bg-[#8CC63F] hover:bg-[#6B9E2B] text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-950/30 disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>¡Guardada con éxito!</span>
              </>
            ) : (
              <span>Guardar Configuración</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
