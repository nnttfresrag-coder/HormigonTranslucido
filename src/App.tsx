import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  Box, 
  Waves, 
  Zap, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  RefreshCcw,
  Lightbulb,
  Thermometer,
  Shield,
  Eye,
  Building2,
  Layout,
  Construction,
  Activity
} from 'lucide-react';

// --- Types & Constants ---

type ComponentId = 'cement' | 'water' | 'sand' | 'fibers';

interface Component {
  id: ComponentId;
  name: string;
  color: string;
  unit: string;
  icon: React.ReactNode;
  description: string;
}

const COMPONENTS: Component[] = [
  { 
    id: 'cement', 
    name: 'Cemento', 
    color: '#8E9299', 
    unit: 'kg', 
    icon: <Box className="w-5 h-5" />,
    description: 'Base estructural de alta resistencia.'
  },
  { 
    id: 'water', 
    name: 'Agua', 
    color: '#3B82F6', 
    unit: 'L', 
    icon: <Droplets className="w-5 h-5" />,
    description: 'Reactivo para la hidratación del cemento.'
  },
  { 
    id: 'sand', 
    name: 'Arena Sílice', 
    color: '#D4B483', 
    unit: 'kg', 
    icon: <Waves className="w-5 h-5" />,
    description: 'Agregado fino para una matriz densa.'
  },
  { 
    id: 'fibers', 
    name: 'Fibras Ópticas', 
    color: '#A5F3FC', 
    unit: 'm', 
    icon: <Zap className="w-5 h-5" />,
    description: 'Conductores de luz de alta pureza.'
  },
];

type SimulationStep = 'selection' | 'mixing' | 'curing' | 'result';

interface Utility {
  title: string;
  icon: React.ReactNode;
  description: string;
}

const UTILITIES: Utility[] = [
  {
    title: 'Arquitectura Sostenible',
    icon: <Building2 className="w-5 h-5" />,
    description: 'Reduce el consumo eléctrico al permitir el paso de luz natural en muros interiores.'
  },
  {
    title: 'Diseño de Interiores',
    icon: <Layout className="w-5 h-5" />,
    description: 'Creación de mobiliario retroiluminado, escaleras y paneles decorativos de lujo.'
  },
  {
    title: 'Seguridad Vial',
    icon: <Construction className="w-5 h-5" />,
    description: 'Señalización en túneles y pasos subterráneos que brilla con luz ambiental o artificial.'
  }
];

// --- Main Component ---

export default function App() {
  const [quantities, setQuantities] = useState<Record<ComponentId, number>>({
    cement: 0,
    water: 0,
    sand: 0,
    fibers: 0,
  });
  const [step, setStep] = useState<SimulationStep>('selection');
  const [progress, setProgress] = useState(0);
  const [curingPhase, setCuringPhase] = useState('');
  const [isLightOn, setIsLightOn] = useState(false);

  // Total volume for visualization
  const totalVolume = useMemo(() => 
    (Object.values(quantities) as number[]).reduce((a, b) => a + b, 0), 
  [quantities]);

  const maxCapacity = 100;

  const handleSetQuantity = (id: ComponentId, value: number) => {
    const otherTotal = (Object.entries(quantities) as [ComponentId, number][])
      .filter(([key]) => key !== id)
      .reduce((acc, [, val]) => acc + val, 0);
    
    if (otherTotal + value <= maxCapacity) {
      setQuantities(prev => ({ ...prev, [id]: value }));
    } else {
      setQuantities(prev => ({ ...prev, [id]: maxCapacity - otherTotal }));
    }
  };

  const resetSimulation = () => {
    setQuantities({ cement: 0, water: 0, sand: 0, fibers: 0 });
    setStep('selection');
    setProgress(0);
    setCuringPhase('');
    setIsLightOn(false);
  };

  const startMixing = () => {
    if (totalVolume < 30) return;
    setStep('mixing');
    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setStep('curing');
          setProgress(0);
        }, 500);
      }
    }, 40);
  };

  useEffect(() => {
    if (step === 'curing') {
      let p = 0;
      const interval = setInterval(() => {
        p += 1;
        setProgress(p);
        
        if (p < 30) setCuringPhase('Fraguado Inicial');
        else if (p < 70) setCuringPhase('Hidratación Exotérmica');
        else setCuringPhase('Endurecimiento y Cristalización');

        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep('result'), 500);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Evaluation Logic
  const evaluation = useMemo(() => {
    if (step !== 'result') return null;

    const { cement, water, sand, fibers } = quantities;
    const total = cement + water + sand + fibers;
    
    // Ratios
    const waterCementRatio = cement > 0 ? water / cement : 0;
    const fiberPercentage = (fibers / total) * 100;
    const cementPercentage = (cement / total) * 100;
    const sandCementRatio = cement > 0 ? sand / cement : 0;

    let score = 100;
    const errors: { type: 'critical' | 'warning', msg: string }[] = [];

    // 1. Water/Cement Ratio Analysis
    if (waterCementRatio < 0.3) {
      score -= 40;
      errors.push({ type: 'critical', msg: "Mezcla seca: El cemento no se hidratará, resultando en un bloque quebradizo." });
    } else if (waterCementRatio < 0.4) {
      score -= 10;
      errors.push({ type: 'warning', msg: "Baja trabajabilidad: Dificultad para envolver las fibras ópticas." });
    } else if (waterCementRatio > 0.6) {
      score -= 35;
      errors.push({ type: 'critical', msg: "Exceso de agua: Segregación de materiales y porosidad extrema." });
    }

    // 2. Fiber Density Analysis
    if (fiberPercentage < 3) {
      score -= 25;
      errors.push({ type: 'warning', msg: "Translucidez insuficiente: El efecto óptico es casi imperceptible." });
    } else if (fiberPercentage > 8) {
      score -= 20;
      errors.push({ type: 'warning', msg: "Debilidad estructural: Demasiadas fibras interrumpen la continuidad del concreto." });
    }

    // 3. Sand/Cement Ratio
    if (sandCementRatio > 2.5) {
      score -= 15;
      errors.push({ type: 'warning', msg: "Mezcla arenosa: Falta de pasta de cemento para unir los agregados." });
    }

    // 4. Critical Failure Check
    if (cementPercentage < 15) {
      score = 10;
      errors.push({ type: 'critical', msg: "Falla en la mezcla en las proporciones: No hay suficiente cemento para formar una estructura sólida." });
    }

    // 5. General Proportion Failure Check
    if (score < 60) {
      errors.unshift({ type: 'critical', msg: "Falla crítica detectada: Desequilibrio severo en las proporciones de la mezcla." });
    }

    // Metrics calculation
    const strength = Math.max(0, Math.min(60, (cement * 0.8) - (water * 0.5) - (fibers * 0.2)));
    const translucency = Math.min(100, fiberPercentage * 12);
    const durability = Math.max(0, 100 - (Math.abs(waterCementRatio - 0.45) * 200));

    let quality: 'Premium' | 'Estándar' | 'Deficiente' | 'Inservible' = 'Premium';
    if (score < 30) quality = 'Inservible';
    else if (score < 60) quality = 'Deficiente';
    else if (score < 85) quality = 'Estándar';

    // Recommendations for improvement
    const recommendations: string[] = [];
    if (waterCementRatio < 0.4) recommendations.push("Aumentar ligeramente la cantidad de agua para mejorar la hidratación.");
    if (waterCementRatio > 0.55) recommendations.push("Reducir la cantidad de agua para evitar la segregación y porosidad.");
    if (fiberPercentage < 4) recommendations.push("Aumentar la densidad de fibras ópticas para mejorar la translucidez.");
    if (fiberPercentage > 7) recommendations.push("Reducir la cantidad de fibras para no comprometer la resistencia estructural.");
    if (cementPercentage < 25) recommendations.push("Aumentar la proporción de cemento para una matriz más sólida.");
    if (sandCementRatio > 2) recommendations.push("Reducir la cantidad de arena o aumentar el cemento para mejorar la cohesión.");

    return { score, quality, errors, recommendations, strength, translucency, durability, fiberPercentage };
  }, [step, quantities]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="border-b border-gray-200 p-6 flex justify-between items-center bg-white sticky top-0 z-50 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_4px_12px_rgba(8,145,178,0.2)]">
            <Activity className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-gray-900 uppercase">
              LiTraCon Simulator <span className="text-cyan-600">v2.0</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
              Light Transmitting Concrete Engineering
            </p>
          </div>
        </div>
        {step !== 'selection' && (
          <button 
            onClick={resetSimulation}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-xs font-bold border border-gray-200 group text-gray-700"
          >
            <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
            NUEVA MEZCLA
          </button>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto p-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Advanced Controls */}
        <div className="xl:col-span-3 space-y-6">
          <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Construction className="w-4 h-4 text-cyan-600" />
                Dosificación
              </h2>
              <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2 py-1 rounded border border-cyan-100">
                TOTAL: {totalVolume}%
              </span>
            </div>

            <div className="space-y-10">
              {COMPONENTS.map((comp) => (
                <div key={comp.id} className="group">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400 group-hover:text-cyan-600 transition-colors border border-gray-100">
                        {comp.icon}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700">{comp.name}</span>
                    </div>
                    <span className="text-xs font-mono text-cyan-600 font-bold">{quantities[comp.id]} {comp.unit}</span>
                  </div>
                  
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    disabled={step !== 'selection'}
                    value={quantities[comp.id]}
                    onChange={(e) => handleSetQuantity(comp.id, parseInt(e.target.value))}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                  
                  <div className="flex justify-between mt-2">
                    <button 
                      onClick={() => handleSetQuantity(comp.id, Math.max(0, quantities[comp.id] - 5))}
                      disabled={step !== 'selection'}
                      className="text-[10px] text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      -5
                    </button>
                    <button 
                      onClick={() => handleSetQuantity(comp.id, Math.min(100, quantities[comp.id] + 5))}
                      disabled={step !== 'selection'}
                      className="text-[10px] text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      +5
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled={step !== 'selection' || totalVolume < 30}
              onClick={startMixing}
              className={`
                w-full mt-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all
                ${step === 'selection' && totalVolume >= 30
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-[0_4px_20px_rgba(8,145,178,0.3)]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
              `}
            >
              <RotateCw className={`w-4 h-4 ${step === 'mixing' ? 'animate-spin' : ''}`} />
              Procesar Material
            </button>
          </section>

          {/* Utilities Section */}
          <section className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Aplicaciones Reales</h2>
            <div className="space-y-6">
              {UTILITIES.map((util, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0 text-cyan-600 border border-cyan-100">
                    {util.icon}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-800 mb-1">{util.title}</h4>
                    <p className="text-[10px] text-gray-500 leading-relaxed">{util.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Center Column: Immersive Visualization */}
        <div className="xl:col-span-6 flex flex-col gap-6">
          <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-200 relative overflow-hidden flex items-center justify-center min-h-[600px] shadow-2xl">
            
            {/* Laboratory Environment */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
            </div>

            {/* The Mold */}
            <div className="relative w-80 h-[450px] z-10 flex flex-col justify-end">
              {/* Glass Container */}
              <div className="absolute inset-0 border-x-8 border-b-8 border-gray-300 rounded-b-[2rem] bg-gray-50/50 backdrop-blur-sm shadow-inner" />
              
              {/* Material Content */}
              <div className="relative w-full overflow-hidden rounded-b-[1.5rem]" style={{ height: `${(totalVolume / maxCapacity) * 100}%` }}>
                <AnimatePresence>
                  {step !== 'selection' && (
                    <motion.div 
                      className="absolute inset-0"
                      initial={{ y: 400 }}
                      animate={{ y: 0 }}
                      transition={{ type: 'spring', damping: 20 }}
                    >
                      {/* Concrete Texture */}
                      <div 
                        className="absolute inset-0 transition-all duration-2000"
                        style={{ 
                          backgroundColor: step === 'mixing' ? '#9CA3AF' : step === 'curing' ? '#6B7280' : '#4B5563',
                          backgroundImage: `url("https://www.transparenttextures.com/patterns/concrete-wall.png")`,
                          filter: step === 'mixing' ? 'contrast(1.1) brightness(1.2)' : 'none'
                        }}
                      />

                      {/* Mixing Particles */}
                      {step === 'mixing' && (
                        <motion.div 
                          className="absolute inset-0 opacity-30"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        >
                          <div className="absolute inset-0 border-[40px] border-dashed border-white/40 rounded-full blur-xl" />
                        </motion.div>
                      )}

                      {/* Fiber Visuals */}
                      {quantities.fibers > 0 && (
                        <div className="absolute inset-0">
                          {Array.from({ length: Math.min(quantities.fibers * 2, 100) }).map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-[1px] h-12 bg-cyan-200/50"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                rotate: `${Math.random() * 180}deg`,
                              }}
                              animate={step === 'mixing' ? {
                                x: [0, Math.random() * 40 - 20],
                                y: [0, Math.random() * 40 - 20],
                                rotate: [0, 360]
                              } : {}}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Error Visuals: Cracks or Bubbles */}
                      {step === 'result' && evaluation && (
                        <>
                          {evaluation.score < 50 && (
                            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cracked-earth.png")' }} />
                          )}
                          {quantities.water > 40 && (
                            <div className="absolute inset-0 flex flex-wrap gap-4 p-4 opacity-20">
                              {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="w-2 h-2 rounded-full bg-white/60 blur-[1px]" />
                              ))}
                            </div>
                          )}
                        </>
                      )}

                      {/* Translucency Effect */}
                      {step === 'result' && isLightOn && (
                        <motion.div 
                          className="absolute inset-0 z-40"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: evaluation?.translucency ? evaluation.translucency / 100 : 0 }}
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, transparent 80%)',
                            mixBlendMode: 'overlay'
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Selection Preview */}
                {step === 'selection' && (
                  <div className="w-full h-full flex flex-col-reverse">
                    {COMPONENTS.map((comp) => (
                      <motion.div
                        key={comp.id}
                        initial={{ height: 0 }}
                        animate={{ height: `${(quantities[comp.id] / maxCapacity) * 100}%` }}
                        style={{ backgroundColor: comp.color }}
                        className="w-full opacity-70 border-t border-white/20"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Light Interaction */}
            {step === 'result' && (
              <div className="absolute bottom-12 flex flex-col items-center gap-6">
                <button
                  onClick={() => setIsLightOn(!isLightOn)}
                  className={`
                    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-4
                    ${isLightOn 
                      ? 'bg-yellow-400 border-yellow-200 text-white shadow-[0_0_60px_rgba(250,204,21,0.4)] scale-110' 
                      : 'bg-gray-100 border-gray-200 text-gray-400 hover:border-gray-300'}
                  `}
                >
                  <Lightbulb className={`w-10 h-10 ${isLightOn ? 'animate-pulse' : ''}`} />
                </button>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Prueba Óptica</p>
                  <p className="text-[9px] font-mono text-cyan-600/60 italic">Simulación de paso de fotones</p>
                </div>
              </div>
            )}

            {/* HUD Overlays */}
            <div className="absolute top-10 left-10 space-y-4">
              <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-gray-200 min-w-[200px] shadow-lg">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Monitor de Fase</p>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${step !== 'selection' ? 'bg-cyan-600 animate-pulse' : 'bg-gray-300'}`} />
                  <span className="text-sm font-black text-gray-800 uppercase tracking-tighter">
                    {step === 'selection' ? 'Standby' : step === 'mixing' ? 'Mezclando' : step === 'curing' ? curingPhase : 'Finalizado'}
                  </span>
                </div>
              </div>

              {(step === 'mixing' || step === 'curing') && (
                <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl border border-gray-200 shadow-lg">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Progreso de Reacción</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-mono font-black text-gray-900">{progress}</span>
                    <span className="text-xs font-mono text-gray-400">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Analysis Dashboard */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {step === 'result' && evaluation ? (
              <motion.section
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Score Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-cyan-100 mb-4 relative">
                    <span className="text-4xl font-black text-gray-900">{evaluation.score}</span>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="276" strokeDashoffset={276 - (276 * evaluation.score) / 100} className="text-cyan-600" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-black uppercase tracking-tighter ${
                    evaluation.quality === 'Premium' ? 'text-cyan-600' :
                    evaluation.quality === 'Estándar' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    Calidad {evaluation.quality}
                  </h3>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Shield className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">Resistencia</span>
                      </div>
                      <span className="text-xs font-mono text-gray-700">{Math.round(evaluation.strength)} MPa</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(evaluation.strength / 60) * 100}%` }} className="h-full bg-emerald-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Eye className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">Translucidez</span>
                      </div>
                      <span className="text-xs font-mono text-gray-700">{Math.round(evaluation.translucency)}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${evaluation.translucency}%` }} className="h-full bg-cyan-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Thermometer className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">Durabilidad</span>
                      </div>
                      <span className="text-xs font-mono text-gray-700">{Math.round(evaluation.durability)}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${evaluation.durability}%` }} className="h-full bg-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recommendations Log */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Mejoras para Nueva Mezcla</h4>
                  <div className="space-y-4">
                    {evaluation.recommendations.length > 0 ? (
                      <ul className="space-y-3">
                        {evaluation.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-3 items-start text-[10px] text-gray-600 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1 shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-700 flex gap-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <p className="text-[10px] leading-relaxed font-medium">Dosificación perfecta. No se requieren ajustes técnicos.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Log */}
                <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Conclusiones y Anomalías</h4>
                  <div className="space-y-4">
                    {evaluation.errors.length > 0 ? (
                      evaluation.errors.map((err, i) => (
                        <div key={i} className={`p-4 rounded-xl border flex gap-3 ${
                          err.type === 'critical' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-yellow-50 border-yellow-100 text-yellow-700'
                        }`}>
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <p className="text-[10px] leading-relaxed font-medium">{err.msg}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex gap-3">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <p className="text-[10px] leading-relaxed font-medium">Mezcla certificada. Proporciones óptimas y sin defectos detectados.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2.5rem] p-12 text-center">
                <Activity className="w-12 h-12 text-gray-200 mb-6" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">
                  Esperando datos de<br />procesamiento...
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="max-w-[1600px] mx-auto px-8 py-16 border-t border-gray-200 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Mecánica de Fraguado</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              El fraguado inicial ocurre cuando el agua reacciona con los silicatos del cemento, formando una red cristalina que atrapa los agregados y las fibras ópticas en una matriz sólida.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Conductividad Lumínica</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              La luz viaja a través de las fibras por reflexión interna total. La eficiencia depende de la alineación paralela de las fibras y la ausencia de burbujas de aire en la interfaz fibra-concreto.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Patologías Comunes</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              La segregación ocurre por exceso de agua, haciendo que las fibras floten o se hundan. La retracción plástica causa grietas si la mezcla se seca demasiado rápido durante la hidratación.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Normativa Técnica</h5>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Este simulador sigue las directrices generales de la norma ASTM C39 para resistencia a la compresión y protocolos experimentales para hormigones translúcidos de alto rendimiento.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
