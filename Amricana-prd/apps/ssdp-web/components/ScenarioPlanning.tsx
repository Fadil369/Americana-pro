import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, TrendingUp, TrendingDown, DollarSign, Package, Users, Calendar } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Scenario {
  id: string
  name: string
  name_ar: string
  description: string
  description_ar: string
  impact: 'positive' | 'negative' | 'neutral'
  parameters: {
    priceChange?: number
    demandChange?: number
    costChange?: number
    capacityChange?: number
  }
}

interface ScenarioPlanningProps {
  locale?: string
  isRTL?: boolean
}

// BRAINSAIT: What-if scenario planning tool for managers
// NEURAL: Interactive scenario modeling and visualization
export default function ScenarioPlanning({ locale = 'ar', isRTL = true }: ScenarioPlanningProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [customParams, setCustomParams] = useState({
    priceChange: 0,
    demandChange: 0,
    costChange: 0
  })

  const t = {
    ar: {
      title: 'تخطيط السيناريوهات',
      subtitle: 'تحليل ماذا-لو لقرارات العمل',
      scenarios: 'السيناريوهات',
      baseline: 'الأساس',
      customScenario: 'سيناريو مخصص',
      priceIncrease: 'زيادة السعر 10%',
      priceDecrease: 'تخفيض السعر 15%',
      ramadanSurge: 'ارتفاع الطلب في رمضان',
      costReduction: 'تقليل التكاليف التشغيلية',
      capacityExpansion: 'توسعة السعة',
      parameters: 'المعاملات',
      priceChange: 'تغيير السعر (%)',
      demandChange: 'تغيير الطلب (%)',
      costChange: 'تغيير التكلفة (%)',
      results: 'النتائج المتوقعة',
      revenue: 'الإيرادات',
      profit: 'الربح',
      volume: 'الحجم',
      margin: 'هامش الربح',
      currentMonth: 'الشهر الحالي',
      projectedMonth: 'الشهر المتوقع',
      impact: 'التأثير',
      positive: 'إيجابي',
      negative: 'سلبي',
      neutral: 'محايد',
      apply: 'تطبيق',
      reset: 'إعادة تعيين',
      // Scenario descriptions
      priceIncreaseDesc: 'رفع الأسعار بنسبة 10% قد يزيد الإيرادات بـ 8% مع انخفاض طفيف في الطلب',
      priceDecreaseDesc: 'تخفيض الأسعار بنسبة 15% قد يزيد الطلب بـ 25% مع انخفاض الهامش',
      ramadanSurgeDesc: 'توقع زيادة 350% في الطلب خلال رمضان',
      costReductionDesc: 'تحسين الكفاءة التشغيلية قد يقلل التكاليف بنسبة 12%',
      capacityExpansionDesc: 'التوسع في السعة يسمح بزيادة الإنتاج بنسبة 40%'
    },
    en: {
      title: 'Scenario Planning',
      subtitle: 'What-if Analysis for Business Decisions',
      scenarios: 'Scenarios',
      baseline: 'Baseline',
      customScenario: 'Custom Scenario',
      priceIncrease: '10% Price Increase',
      priceDecrease: '15% Price Discount',
      ramadanSurge: 'Ramadan Demand Surge',
      costReduction: 'Operational Cost Reduction',
      capacityExpansion: 'Capacity Expansion',
      parameters: 'Parameters',
      priceChange: 'Price Change (%)',
      demandChange: 'Demand Change (%)',
      costChange: 'Cost Change (%)',
      results: 'Expected Results',
      revenue: 'Revenue',
      profit: 'Profit',
      volume: 'Volume',
      margin: 'Profit Margin',
      currentMonth: 'Current Month',
      projectedMonth: 'Projected Month',
      impact: 'Impact',
      positive: 'Positive',
      negative: 'Negative',
      neutral: 'Neutral',
      apply: 'Apply',
      reset: 'Reset',
      // Scenario descriptions
      priceIncreaseDesc: 'Raising prices by 10% may increase revenue by 8% with slight demand drop',
      priceDecreaseDesc: 'Reducing prices by 15% may boost demand by 25% with lower margins',
      ramadanSurgeDesc: 'Expect 350% surge in demand during Ramadan',
      costReductionDesc: 'Improving operational efficiency may reduce costs by 12%',
      capacityExpansionDesc: 'Capacity expansion allows for 40% production increase'
    }
  }

  const text = t[locale as keyof typeof t] || t.ar

  const scenarios: Scenario[] = [
    {
      id: 'price-increase',
      name: text.priceIncrease,
      name_ar: 'زيادة السعر 10%',
      description: text.priceIncreaseDesc,
      description_ar: 'رفع الأسعار بنسبة 10% قد يزيد الإيرادات بـ 8% مع انخفاض طفيف في الطلب',
      impact: 'positive',
      parameters: { priceChange: 10, demandChange: -5, costChange: 0 }
    },
    {
      id: 'price-decrease',
      name: text.priceDecrease,
      name_ar: 'تخفيض السعر 15%',
      description: text.priceDecreaseDesc,
      description_ar: 'تخفيض الأسعار بنسبة 15% قد يزيد الطلب بـ 25% مع انخفاض الهامش',
      impact: 'neutral',
      parameters: { priceChange: -15, demandChange: 25, costChange: 0 }
    },
    {
      id: 'ramadan',
      name: text.ramadanSurge,
      name_ar: 'ارتفاع الطلب في رمضان',
      description: text.ramadanSurgeDesc,
      description_ar: 'توقع زيادة 350% في الطلب خلال رمضان',
      impact: 'positive',
      parameters: { priceChange: 0, demandChange: 350, costChange: 15 }
    },
    {
      id: 'cost-reduction',
      name: text.costReduction,
      name_ar: 'تقليل التكاليف التشغيلية',
      description: text.costReductionDesc,
      description_ar: 'تحسين الكفاءة التشغيلية قد يقلل التكاليف بنسبة 12%',
      impact: 'positive',
      parameters: { priceChange: 0, demandChange: 0, costChange: -12 }
    },
    {
      id: 'capacity',
      name: text.capacityExpansion,
      name_ar: 'توسعة السعة',
      description: text.capacityExpansionDesc,
      description_ar: 'التوسع في السعة يسمح بزيادة الإنتاج بنسبة 40%',
      impact: 'positive',
      parameters: { priceChange: 0, demandChange: 0, costChange: 8, capacityChange: 40 }
    }
  ]

  const baselineData = {
    revenue: 450000,
    cost: 300000,
    profit: 150000,
    volume: 9000,
    margin: 33.3
  }

  const calculateScenario = (params: typeof customParams) => {
    const priceMultiplier = 1 + (params.priceChange / 100)
    const demandMultiplier = 1 + (params.demandChange / 100)
    const costMultiplier = 1 + (params.costChange / 100)

    const newVolume = baselineData.volume * demandMultiplier
    const newRevenue = (baselineData.revenue / baselineData.volume) * newVolume * priceMultiplier
    const newCost = baselineData.cost * costMultiplier * (demandMultiplier > 1 ? demandMultiplier : 1)
    const newProfit = newRevenue - newCost
    const newMargin = (newProfit / newRevenue) * 100

    return {
      revenue: Math.round(newRevenue),
      cost: Math.round(newCost),
      profit: Math.round(newProfit),
      volume: Math.round(newVolume),
      margin: parseFloat(newMargin.toFixed(1))
    }
  }

  const getActiveScenarioData = () => {
    if (selectedScenario === 'custom') {
      return calculateScenario(customParams)
    }
    
    const scenario = scenarios.find(s => s.id === selectedScenario)
    if (scenario) {
      return calculateScenario({
        priceChange: scenario.parameters.priceChange || 0,
        demandChange: scenario.parameters.demandChange || 0,
        costChange: scenario.parameters.costChange || 0
      })
    }
    
    return baselineData
  }

  const scenarioData = getActiveScenarioData()
  const comparisonData = [
    {
      name: text.currentMonth,
      [text.revenue]: baselineData.revenue / 1000,
      [text.profit]: baselineData.profit / 1000,
      [text.volume]: baselineData.volume
    },
    {
      name: text.projectedMonth,
      [text.revenue]: scenarioData.revenue / 1000,
      [text.profit]: scenarioData.profit / 1000,
      [text.volume]: scenarioData.volume
    }
  ]

  const getImpactColor = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100
    if (change > 5) return 'text-green-400'
    if (change < -5) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getImpactIcon = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100
    if (change > 5) return <TrendingUp className="w-5 h-5" />
    if (change < -5) return <TrendingDown className="w-5 h-5" />
    return <span className="text-lg">→</span>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Lightbulb className="w-6 h-6 text-brand-orange" />
          <h2 className="text-2xl font-bold text-white">{text.title}</h2>
        </div>
        <p className="text-white/60 text-sm">{text.subtitle}</p>
      </div>

      {/* Scenario Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">{text.scenarios}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedScenario(null)}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedScenario === null
                ? 'border-brand-orange bg-brand-orange/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <h4 className="font-semibold text-white mb-1">{text.baseline}</h4>
            <p className="text-xs text-white/60">Current performance</p>
          </button>

          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario === scenario.id
                  ? 'border-brand-orange bg-brand-orange/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <h4 className="font-semibold text-white mb-1">
                {locale === 'ar' ? scenario.name_ar : scenario.name}
              </h4>
              <p className="text-xs text-white/60">
                {locale === 'ar' ? scenario.description_ar : scenario.description}
              </p>
            </button>
          ))}

          <button
            onClick={() => setSelectedScenario('custom')}
            className={`p-4 rounded-xl border text-left transition-all ${
              selectedScenario === 'custom'
                ? 'border-brand-orange bg-brand-orange/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <h4 className="font-semibold text-white mb-1">{text.customScenario}</h4>
            <p className="text-xs text-white/60">Define your own parameters</p>
          </button>
        </div>
      </div>

      {/* Custom Parameters */}
      {selectedScenario === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4">{text.parameters}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                {text.priceChange}: {customParams.priceChange}%
              </label>
              <input
                type="range"
                min="-50"
                max="50"
                value={customParams.priceChange}
                onChange={(e) => setCustomParams({ ...customParams, priceChange: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                {text.demandChange}: {customParams.demandChange}%
              </label>
              <input
                type="range"
                min="-50"
                max="400"
                value={customParams.demandChange}
                onChange={(e) => setCustomParams({ ...customParams, demandChange: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">
                {text.costChange}: {customParams.costChange}%
              </label>
              <input
                type="range"
                min="-30"
                max="50"
                value={customParams.costChange}
                onChange={(e) => setCustomParams({ ...customParams, costChange: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <button
              onClick={() => setCustomParams({ priceChange: 0, demandChange: 0, costChange: 0 })}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              {text.reset}
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Comparison */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            {getImpactIcon(scenarioData.revenue, baselineData.revenue)}
          </div>
          <h4 className="text-xs text-white/60 mb-1">{text.revenue}</h4>
          <p className={`text-2xl font-bold ${getImpactColor(scenarioData.revenue, baselineData.revenue)}`}>
            {(scenarioData.revenue / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            {getImpactIcon(scenarioData.profit, baselineData.profit)}
          </div>
          <h4 className="text-xs text-white/60 mb-1">{text.profit}</h4>
          <p className={`text-2xl font-bold ${getImpactColor(scenarioData.profit, baselineData.profit)}`}>
            {(scenarioData.profit / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-orange-400" />
            {getImpactIcon(scenarioData.volume, baselineData.volume)}
          </div>
          <h4 className="text-xs text-white/60 mb-1">{text.volume}</h4>
          <p className={`text-2xl font-bold ${getImpactColor(scenarioData.volume, baselineData.volume)}`}>
            {scenarioData.volume.toLocaleString()}
          </p>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-400" />
            {getImpactIcon(scenarioData.margin, baselineData.margin)}
          </div>
          <h4 className="text-xs text-white/60 mb-1">{text.margin}</h4>
          <p className={`text-2xl font-bold ${getImpactColor(scenarioData.margin, baselineData.margin)}`}>
            {scenarioData.margin}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/5 rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
            <Legend />
            <Bar dataKey={text.revenue} fill="#f97316" />
            <Bar dataKey={text.profit} fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
