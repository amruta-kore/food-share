'use client';

import React, { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';
import { useLanguage } from '../app/context/LanguageProvider';

export const FloatingFeedbackButton: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { language } = useLanguage();
  const isMarathi = language === 'mr';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          onClick={() => setModalOpen(true)}
          type="button"
          className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-full shadow-lg hover:shadow-xl shadow-emerald-700/20 hover:scale-105 active:scale-95 transition-all duration-200 border border-emerald-400/30"
          title={isMarathi ? 'अन्नसेतूला रेटिंग आणि अभिप्राय द्या' : 'Give Rating & Feedback to AnnaSetu'}
        >
          <span className="text-base animate-bounce">⭐</span>
          <span className="hidden sm:inline">
            {isMarathi ? 'अभिप्राय / रेटिंग द्या' : 'Rate Platform / Feedback'}
          </span>
          <span className="sm:hidden">
            {isMarathi ? 'अभिप्राय' : 'Feedback'}
          </span>
        </button>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          // Trigger optional event for pages listening for new reviews
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('annasetu:feedback-submitted'));
            window.dispatchEvent(new CustomEvent('foodshare:feedback-submitted'));
          }
        }}
      />
    </>
  );
};

export default FloatingFeedbackButton;
