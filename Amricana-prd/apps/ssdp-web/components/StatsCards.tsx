import React from 'react';
import { motion } from 'framer-motion';
import { 
  TruckIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const StatsCards = () => {
  const stats = [
    {
      name: 'إجمالي المبيعات اليوم',
      value: '125,430 ريال',
      change: '+12.5%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'المركبات النشطة',
      value: '24',
      change: '+2',
      changeType: 'increase',
      icon: TruckIcon,
    },
    {
      name: 'العملاء النشطون',
      value: '1,234',
      change: '+5.2%',
      changeType: 'increase',
      icon: UserGroupIcon,
    },
    {
      name: 'الطلبات المكتملة',
      value: '89',
      change: '+8.1%',
      changeType: 'increase',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-blue-600/10" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="rounded-lg bg-orange-500/20 p-2">
                  <stat.icon className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <div className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {stat.name}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCards;
