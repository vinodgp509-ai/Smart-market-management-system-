import React, { useState } from 'react';
import { Product } from '../../types/market';
import { Scale, Check, X, RefreshCw } from 'lucide-react';

interface ProduceScaleModalProps {
  product: Product;
  onConfirm: (product: Product, weightKg: number) => void;
  onClose: () => void;
}

export const ProduceScaleModal: React.FC<ProduceScaleModalProps> = ({
  product,
  onConfirm,
  onClose
}) => {
  const [weightKg, setWeightKg] = useState<number>(0.85); // default realistic weight
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  const effectivePricePerKg = product.dynamicDiscountPercent > 0
    ? product.price * (1 - product.dynamicDiscountPercent / 100)
    : product.price;

  const totalCalculated = (weightKg * effectivePricePerKg);

  const handleTare = () => {
    setWeightKg(0);
  };

  const handlePreset = (addKg: number) => {
    setWeightKg(prev => Number(Math.max(0.1, prev + addKg).toFixed(2)));
  };

  const handleUnitToggle = (newUnit: 'kg' | 'lb') => {
    if (newUnit === unit) return;
    if (newUnit === 'lb') {
      setWeightKg(prev => Number((prev * 2.20462).toFixed(2)));
    } else {
      setWeightKg(prev => Number((prev / 2.20462).toFixed(2)));
    }
    setUnit(newUnit);
  };

  const normalizedKg = unit === 'lb' ? weightKg / 2.20462 : weightKg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">{product.name}</h3>
              <p className="text-xs text-slate-400">Smart Scale Station · {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Digital Scale Readout Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-center relative overflow-hidden">
            <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
              <span className="font-mono uppercase tracking-wider">NET WEIGHT</span>
              <div className="flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                <button
                  onClick={() => handleUnitToggle('kg')}
                  className={`text-[11px] px-1.5 py-0.5 rounded ${unit === 'kg' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  KG
                </button>
                <button
                  onClick={() => handleUnitToggle('lb')}
                  className={`text-[11px] px-1.5 py-0.5 rounded ${unit === 'lb' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  LB
                </button>
              </div>
            </div>

            {/* Big Digital Readout */}
            <div className="font-mono font-bold text-4xl text-emerald-400 tracking-tight tabular-nums my-1">
              {weightKg.toFixed(2)}
              <span className="text-lg text-emerald-500/70 ml-1 font-normal uppercase">{unit}</span>
            </div>

            {/* Price calculation formula */}
            <div className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
              <span>Rate: ${effectivePricePerKg.toFixed(2)} / kg</span>
              <span className="font-medium text-slate-200">
                Computed: <strong className="text-white font-mono text-sm">${totalCalculated.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Scale Control presets */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Quick Weight Adjustments</span>
              <button
                onClick={handleTare}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Zero / Tare</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handlePreset(0.1)}
                className="py-2 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
              >
                +0.10
              </button>
              <button
                onClick={() => handlePreset(0.25)}
                className="py-2 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
              >
                +0.25
              </button>
              <button
                onClick={() => handlePreset(0.5)}
                className="py-2 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
              >
                +0.50
              </button>
              <button
                onClick={() => handlePreset(1.0)}
                className="py-2 text-xs font-mono font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
              >
                +1.00
              </button>
            </div>

            {/* Slider for fine adjustment */}
            <div className="mt-3">
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.05"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>0.10 kg</span>
                <span>2.50 kg</span>
                <span>5.00 kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Line Total: <span className="font-mono font-semibold text-emerald-400 text-sm">${totalCalculated.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (normalizedKg > 0) {
                  onConfirm(product, Number(normalizedKg.toFixed(3)));
                }
              }}
              disabled={normalizedKg <= 0}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
