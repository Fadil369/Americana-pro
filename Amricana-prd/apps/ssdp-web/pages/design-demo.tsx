// NEURAL: Design system demonstration page
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, BilingualText, MeshGradient } from '@/components/ui';
import { Sparkles, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function DesignDemo() {
  const router = useRouter();
  const isRTL = router.locale === 'ar';
  const [activeTab, setActiveTab] = useState('colors');

  const colors = [
    { name: 'Sweet Amber', class: 'bg-amber-600', hex: '#ea580c', usage: 'Primary' },
    { name: 'Royal Midnight', class: 'bg-midnight-900', hex: '#1a365d', usage: 'Secondary' },
    { name: 'Fresh Mint', class: 'bg-mint-500', hex: '#0ea5e9', usage: 'Accent' },
    { name: 'Oasis Green', class: 'bg-oasis-500', hex: '#10b981', usage: 'Success' },
    { name: 'Desert Gold', class: 'bg-gold-500', hex: '#f59e0b', usage: 'Warning' },
    { name: 'Sandstone Gray', class: 'bg-sandstone-500', hex: '#64748b', usage: 'Neutral' },
  ];

  const tabs = [
    { id: 'colors', labelAr: 'الألوان', labelEn: 'Colors' },
    { id: 'glass', labelAr: 'الزجاج', labelEn: 'Glass' },
    { id: 'mesh', labelAr: 'الشبكة', labelEn: 'Mesh' },
    { id: 'buttons', labelAr: 'الأزرار', labelEn: 'Buttons' },
  ];

  return (
    <>
      <Head>
        <title>Design System Demo - BrainSAIT SSDP</title>
        <meta name="description" content="BrainSAIT SSDP Design System Demonstration" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <MeshGradient className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <BilingualText
              as="h1"
              ar="نظام تصميم BrainSAIT"
              en="BrainSAIT Design System"
              className="text-5xl font-bold text-white mb-4"
            />
            <BilingualText
              as="p"
              ar="مجموعة شاملة من المكونات والأنماط"
              en="Comprehensive collection of components and styles"
              className="text-xl text-white/80"
            />
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {isRTL ? tab.labelAr : tab.labelEn}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Colors Section */}
            {activeTab === 'colors' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8">
                  <BilingualText
                    as="h2"
                    ar="لوحة الألوان"
                    en="Color Palette"
                    className="text-3xl font-bold text-white mb-6"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colors.map((color) => (
                      <motion.div
                        key={color.name}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white/5 rounded-xl p-6 border border-white/10"
                      >
                        <div className={`${color.class} h-32 rounded-lg mb-4`}></div>
                        <h3 className="text-xl font-semibold text-white mb-2">{color.name}</h3>
                        <p className="text-white/70 mb-1">{color.hex}</p>
                        <span className="text-sm text-white/60">{color.usage}</span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Glass Morphism Section */}
            {activeTab === 'glass' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <GlassCard className="p-8">
                  <BilingualText
                    as="h2"
                    ar="بطاقات الزجاج"
                    en="Glass Morphism Cards"
                    className="text-3xl font-bold text-white mb-6"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard hover className="p-6">
                      <CheckCircle className="w-12 h-12 text-oasis-500 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Standard Glass</h3>
                      <p className="text-white/70">Basic glass effect with hover</p>
                    </GlassCard>
                    <GlassCard hover gradient className="p-6">
                      <Sparkles className="w-12 h-12 text-mint-500 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Gradient Glass</h3>
                      <p className="text-white/70">Glass with gradient background</p>
                    </GlassCard>
                    <GlassCard className="p-6">
                      <TrendingUp className="w-12 h-12 text-amber-600 mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Static Glass</h3>
                      <p className="text-white/70">Glass without hover effects</p>
                    </GlassCard>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Mesh Gradient Section */}
            {activeTab === 'mesh' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8">
                  <BilingualText
                    as="h2"
                    ar="التدرجات الشبكية"
                    en="Mesh Gradients"
                    className="text-3xl font-bold text-white mb-6"
                  />
                  <div className="space-y-6">
                    <div className="brainsait-mesh h-64 rounded-xl flex items-center justify-center">
                      <p className="text-white text-2xl font-bold">Static Mesh with 60% Wireframe</p>
                    </div>
                    <div className="brainsait-mesh-animated h-64 rounded-xl flex items-center justify-center">
                      <p className="text-white text-2xl font-bold">Animated Mesh Gradient</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Buttons Section */}
            {activeTab === 'buttons' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="p-8">
                  <BilingualText
                    as="h2"
                    ar="الأزرار"
                    en="Buttons"
                    className="text-3xl font-bold text-white mb-6"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Button Styles</h3>
                      <div className="space-y-4">
                        <button className="brainsait-btn brainsait-btn-primary w-full">
                          Primary Button
                        </button>
                        <button className="brainsait-btn brainsait-btn-secondary w-full">
                          Secondary Button
                        </button>
                        <button className="brainsait-btn brainsait-btn-success w-full">
                          Success Button
                        </button>
                        <button className="brainsait-btn brainsait-btn-ghost w-full">
                          Ghost Button
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Icon Buttons</h3>
                      <div className="space-y-4">
                        <button className="brainsait-btn brainsait-btn-primary w-full flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          With Icon
                        </button>
                        <button className="brainsait-btn brainsait-btn-secondary w-full flex items-center justify-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Secondary Icon
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <GlassCard className="p-6 inline-block">
              <BilingualText
                as="p"
                ar="صُنع في المملكة العربية السعودية 🇸🇦"
                en="Made in Saudi Arabia 🇸🇦"
                className="text-white/80"
              />
              <p className="text-white/60 mt-2">BrainSAIT © 2025</p>
            </GlassCard>
          </motion.div>
        </div>
      </MeshGradient>
    </>
  );
}
