import React, { useState } from 'react';
import { Product } from '../../types/market';
import { ScanLine, X, Search, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface BarcodeScannerModalProps {
  products: Product[];
  onScan: (product: Product) => void;
  onClose: () => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  products,
  onScan,
  onClose
}) => {
  const [manualInput, setManualInput] = useState('');
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  const handleSimulatedScan = (prod: Product) => {
    soundEngine.playScanBeep();
    setLastScanned(prod.name);
    onScan(prod);
    setTimeout(() => {
      setLastScanned(null);
    }, 1500);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;

    const query = manualInput.trim().toLowerCase();
    const found = products.find(
      p => p.barcode.toLowerCase() === query || p.sku.toLowerCase() === query || p.name.toLowerCase().includes(query)
    );

    if (found) {
      handleSimulatedScan(found);
      setManualInput('');
    } else {
      soundEngine.playErrorTone();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ScanLine className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Smart Optical Scanner</h3>
              <p className="text-xs text-slate-400">Simulated 1D/2D Barcode Engine & EAN-13 Reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Scanner Screen with Laser Line */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col items-center justify-center relative min-h-[160px] overflow-hidden">
          {/* Target box */}
          <div className="w-64 h-32 border-2 border-dashed border-emerald-500/60 rounded-lg relative flex items-center justify-center bg-emerald-950/10">
            {/* Animated Laser Scanning Beam */}
            <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-bounce" />

            <div className="text-center pointer-events-none">
              <span className="text-[11px] font-mono uppercase text-emerald-400/90 tracking-wider">
                POINT BARCODE AT RETICLE
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Automatic laser focus active</p>
            </div>
          </div>

          {lastScanned && (
            <div className="absolute bottom-2 inset-x-4 bg-emerald-500/90 text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center justify-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Scanned: {lastScanned}</span>
            </div>
          )}
        </div>

        {/* Manual Barcode / SKU Entry */}
        <div className="p-4 border-b border-slate-800 bg-slate-900">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter barcode or SKU (e.g. 890123450001 or PROD-APP-01)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Scan</span>
            </button>
          </form>
        </div>

        {/* Click-to-scan product barcodes list */}
        <div className="p-4 flex-1 overflow-y-auto space-y-2">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Available Barcodes on Shelf (Click to scan)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {products.slice(0, 10).map((prod) => (
              <button
                key={prod.id}
                onClick={() => handleSimulatedScan(prod)}
                className="text-left p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-colors flex items-center justify-between group"
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-medium text-slate-200 group-hover:text-emerald-400 truncate">
                    {prod.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {prod.barcode} · {prod.sku}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    ${prod.price.toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-medium">Scan</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};
