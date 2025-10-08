import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import StatsCards from '../components/StatsCards';
import LiveOperationsMap from '../components/LiveOperationsMap';
import SalesChart from '../components/SalesChart';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>SSDP Dashboard - Smart Sweet Distribution Platform</title>
        <meta name="description" content="Real-time analytics and operations management" />
      </Head>

      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              لوحة التحكم الرئيسية
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('ar-SA')}
            </div>
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                العمليات المباشرة
              </h2>
              <LiveOperationsMap />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                تحليل المبيعات
              </h2>
              <SalesChart />
            </div>
          </div>
        </motion.div>
      </DashboardLayout>
    </>
  );
}
