import React, { useState } from 'react';
import { SensorDevice } from '../../types/market';
import { Activity, Thermometer, ShieldAlert, Cpu, Battery, Wifi, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface IoTMonitoringViewProps {
  sensors: SensorDevice[];
  setSensors: React.Dispatch<React.SetStateAction<SensorDevice[]>>;
}

export const IoTMonitoringView: React.FC<IoTMonitoringViewProps> = ({
  sensors,
  setSensors
}) => {
  const [selectedSensor, setSelectedSensor] = useState<SensorDevice | null>(null);

  // Helper to simulate temperature change or refresh telemetry
  const handleSimulateTelemetry = (sensorId: string, tempDelta: number) => {
    setSensors(prev =>
      prev.map(s => {
        if (s.id === sensorId && s.currentTemp !== undefined) {
          const newTemp = Number((s.currentTemp + tempDelta).toFixed(1));
          let status: SensorDevice['status'] = 'nominal';

          if (s.maxSafeTemp !== undefined && newTemp > s.maxSafeTemp) {
            status = 'alert';
          } else if (s.maxSafeTemp !== undefined && newTemp > s.maxSafeTemp - 1.0) {
            status = 'warning';
          }

          return {
            ...s,
            currentTemp: newTemp,
            status,
            lastTelemetry: new Date().toLocaleTimeString()
          };
        }
        return s;
      })
    );
  };

  const handleSimulateRestockShelf = (sensorId: string) => {
    setSensors(prev =>
      prev.map(s => {
        if (s.id === sensorId && s.shelfCapacityKg) {
          return {
            ...s,
            shelfWeightKg: s.shelfCapacityKg * 0.9,
            status: 'nominal',
            lastTelemetry: new Date().toLocaleTimeString()
          };
        }
        return s;
      })
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Smart Market IoT Hub & HACCP Cold-Chain</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live continuous telemetry from refrigeration compressors, shelf weight load cells, and ESL gateways
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-300">Gateway: 2.4GHz Mesh (Active)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg">
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono text-slate-300">Active Nodes: {sensors.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {/* Section 1: HACCP Cold Chain Refrigeration Telemetry */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Refrigeration & Cold-Chain Compliance (HACCP)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Audited against FDA food safety critical control points
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {sensors.filter(s => s.type === 'cold_chain').map((sensor) => {
              const isAlert = sensor.status === 'alert';
              const isWarning = sensor.status === 'warning';

              return (
                <div
                  key={sensor.id}
                  className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between transition-colors ${
                    isAlert
                      ? 'border-rose-500/80 bg-rose-950/20'
                      : isWarning
                      ? 'border-amber-500/80 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{sensor.name}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{sensor.location}</div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                            isAlert
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold animate-pulse'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}
                        >
                          {sensor.status}
                        </span>
                      </div>
                    </div>

                    {/* Gauge Display */}
                    <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-center relative">
                      <div className="text-[10px] font-mono uppercase text-slate-500 mb-0.5">CURRENT TEMPERATURE</div>
                      <div className="font-mono font-bold text-3xl text-cyan-300 tracking-tight tabular-nums">
                        {sensor.currentTemp?.toFixed(1)}°C
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        Safe Range: {sensor.minSafeTemp}°C to {sensor.maxSafeTemp}°C
                      </div>
                      {sensor.humidity && (
                        <div className="text-[11px] text-slate-400 mt-1 font-mono">
                          Humidity: <strong className="text-slate-200">{sensor.humidity}% RH</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Simulator Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Simulate Temperature Drift:</span>
                      <span className="font-mono text-[10px]">{sensor.lastTelemetry}</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleSimulateTelemetry(sensor.id, -1.0)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono rounded border border-slate-700 transition-colors"
                      >
                        -1.0°C (Cool)
                      </button>
                      <button
                        onClick={() => handleSimulateTelemetry(sensor.id, +1.0)}
                        className="flex-1 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-mono rounded border border-slate-700 transition-colors"
                      >
                        +1.0°C (Warm)
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Smart Shelves with IoT Weight Load Cells */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>Smart Shelves & Load-Cell Weight Sensors</span>
              </h3>
              <p className="text-xs text-slate-400">
                Continuous weight monitoring prevents stockouts and phantom inventory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sensors.filter(s => s.type === 'smart_shelf').map((sensor) => {
              const weight = sensor.shelfWeightKg || 0;
              const capacity = sensor.shelfCapacityKg || 1;
              const fillPercent = Math.min(100, Math.round((weight / capacity) * 100));
              const isLow = fillPercent < 25;

              return (
                <div
                  key={sensor.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-white">{sensor.name}</h4>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">{sensor.location}</div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{sensor.batteryLevel}%</span>
                      </div>
                    </div>

                    {/* Weight Bar */}
                    <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-400">Shelf Fill Status:</span>
                        <span className="font-mono font-bold text-white">
                          {weight.toFixed(1)} / {capacity} kg ({fillPercent}%)
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLow ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>

                      {isLow && (
                        <div className="text-[11px] text-amber-400 flex items-center gap-1 pt-1 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Shelf capacity critically low. Restock required.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400 text-[11px]">Sensor Node: {sensor.id}</span>
                    <button
                      onClick={() => handleSimulateRestockShelf(sensor.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-medium rounded border border-slate-700 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Simulate Restock</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Supermarket Aisle Map Floorplan */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Store Aisle Map & Sensor Node Layout</h3>
              <p className="text-xs text-slate-400">Physical layout, RF node health, and customer flow</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                Nominal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                Alert
              </span>
            </div>
          </div>

          {/* Interactive Store Blueprint */}
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 relative overflow-hidden">
            <div className="grid grid-cols-6 gap-3 min-h-[220px]">
              {/* Aisle 1: Produce */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-emerald-400">Aisle 1</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Fresh Produce</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Mist Cooler Node</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-mono">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>6.2°C (Warning)</span>
                </div>
              </div>

              {/* Aisle 2: Bakery */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-amber-400">Aisle 2</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Artisan Bakery</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Smart Shelf 1</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>10.8 kg Load</span>
                </div>
              </div>

              {/* Aisle 3: Dairy */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-cyan-400">Aisle 3</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Dairy & Eggs</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Gravity Chiller</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>2.8°C Nominal</span>
                </div>
              </div>

              {/* Aisle 4: Pantry */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-purple-400">Aisle 4</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Pantry & Spices</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Ambient Shelf</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>21.4°C Ambient</span>
                </div>
              </div>

              {/* Aisle 5: Beverages */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-blue-400">Aisle 5</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Beverages</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Drink Case</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>3.4°C Nominal</span>
                </div>
              </div>

              {/* Aisle 6: Frozen & Meat */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700">
                <div>
                  <div className="text-xs font-bold text-indigo-400">Aisle 6</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Deep Frozen</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">Island Freezer</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>-19.4°C Nominal</span>
                </div>
              </div>
            </div>

            {/* Bottom Bay: POS Checkout Bays */}
            <div className="mt-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-white font-semibold flex items-center gap-2">
                <span>Front Entrance & Automated Checkout Bays</span>
              </span>
              <span>Lane 1 (Express Active) · Lane 2 (Standby) · Lane 3 (Self-Scan)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
