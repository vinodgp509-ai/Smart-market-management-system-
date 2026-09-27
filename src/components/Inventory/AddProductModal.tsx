import React, { useState } from 'react';
import { Product, StorageTemp } from '../../types/market';
import { X, Plus, Barcode, Check } from 'lucide-react';

interface AddProductModalProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Produce');
  const [sku, setSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [barcode, setBarcode] = useState(`890123${Math.floor(100000 + Math.random() * 900000)}`);
  const [price, setPrice] = useState(3.99);
  const [costPrice, setCostPrice] = useState(1.80);
  const [stock, setStock] = useState(25);
  const [minThreshold, setMinThreshold] = useState(10);
  const [unit, setUnit] = useState<Product['unit']>('item');
  const [weightBased, setWeightBased] = useState(false);
  const [expiryDate, setExpiryDate] = useState('2026-10-15');
  const [aisle, setAisle] = useState('Aisle 1');
  const [shelf, setShelf] = useState('Bay 1');
  const [tempRequirement, setTempRequirement] = useState<StorageTemp>('ambient');
  const [supplier, setSupplier] = useState('Cascade Valley Orchards');

  const handleGenerateBarcode = () => {
    setBarcode(`890123${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: name.trim(),
      category,
      sku: sku.trim().toUpperCase(),
      barcode: barcode.trim(),
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      minStockThreshold: Number(minThreshold),
      unit,
      weightBased,
      expiryDate,
      batchNumber: `BCH-${Date.now().toString().slice(-5)}`,
      aisle,
      shelf,
      tempRequirement,
      dynamicDiscountPercent: 0,
      supplier,
      lastESLSync: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };

    onAdd(newProduct);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Create New Market SKU</h3>
              <p className="text-xs text-slate-400">Add product item to store inventory and generate barcode</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-slate-300 mb-1 font-medium">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Honeycrisp Apples"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Produce">Produce</option>
                <option value="Bakery">Bakery</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Pantry">Pantry</option>
                <option value="Beverages">Beverages</option>
                <option value="Frozen & Meat">Frozen & Meat</option>
                <option value="Household">Household</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Supplier</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-medium">Barcode (EAN/UPC)</label>
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Barcode className="w-3 h-3" />
                  Generate
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Retail Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Cost Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Initial Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Min Reorder Alert Threshold</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Aisle Location</label>
              <input
                type="text"
                value={aisle}
                onChange={(e) => setAisle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Shelf / Bay</label>
              <input
                type="text"
                value={shelf}
                onChange={(e) => setShelf(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Storage Temperature</label>
              <select
                value={tempRequirement}
                onChange={(e) => setTempRequirement(e.target.value as StorageTemp)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ambient">Ambient (Room Temp)</option>
                <option value="chilled">Chilled Cooler (0°C to 4°C)</option>
                <option value="frozen">Deep Freezer (-18°C)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={weightBased}
                onChange={(e) => {
                  setWeightBased(e.target.checked);
                  if (e.target.checked) setUnit('kg');
                  else setUnit('item');
                }}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-slate-300">Sold by Weight (triggers smart scale at checkout)</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish SKU</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
