import React, { useState } from 'react';
import { X, Home, FileText, User, DollarSign, Settings } from 'lucide-react';

export function MobileBottomSheet({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 fade-in"
        onClick={onClose}
      ></div>

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl slide-in-up max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function MobileBottomNavigation({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'apply', label: 'Apply', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-30">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-all duration-300 ${
                isActive
                  ? 'text-blue-600 border-t-2 border-blue-600 smooth-colors'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MobileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100 fade-in-up smooth-transition ${className}`}>
      {children}
    </div>
  );
}

export function MobileTouchButton({ children, onClick, variant = 'primary' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary' | 'danger' }) {
  const variants = {
    primary: 'bg-blue-600 text-white active:bg-blue-700 active:scale-95',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300 active:scale-95',
    danger: 'bg-red-600 text-white active:bg-red-700 active:scale-95',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 smooth-transition ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export function MobileSwipeableCard({ items }: { items: Array<{ id: string; title: string; subtitle: string; amount?: string; icon?: React.ReactNode }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };

  const item = items[currentIndex];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-4 select-none cursor-grab active:cursor-grabbing transition-all"
    >
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="text-blue-100 text-sm">{item.title}</p>
          <h3 className="text-2xl font-bold mt-1">{item.subtitle}</h3>
        </div>
        {item.icon && <div className="text-blue-200">{item.icon}</div>}
      </div>

      {item.amount && (
        <div className="text-3xl font-bold mb-4">{item.amount}</div>
      )}

      {/* Navigation dots */}
      <div className="flex gap-1 justify-center">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1 rounded-full transition-all ${
              i === currentIndex ? 'bg-white w-6' : 'bg-blue-400 w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function MobileDetailSheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 md:hidden flex items-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 fade-in"
        onClick={onClose}
      ></div>

      {/* Sheet */}
      <div className="relative w-full bg-white rounded-t-2xl slide-in-up max-h-[80vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-24">
          {children}
        </div>
      </div>
    </div>
  );
}

export function MobileAccordion({ items }: { items: Array<{ title: string; content: React.ReactNode }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden fade-in-up smooth-transition">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">{item.title}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {openIndex === i && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 slide-in-down text-sm text-gray-700">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
