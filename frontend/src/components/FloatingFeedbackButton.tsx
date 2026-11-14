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
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setModalOpen(true)}
          type="button"
          className="flex items-center space-x-2.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-full shadow-crafted hover:shadow-crafted-hover active:scale-95 transition-all duration-150 border border-stone-700/80 cursor-pointer group"
          title={isMarathi ? 'अन्नसेतूला रेटिंग आणि अभिप्राय द्या' : 'Give Rating & Feedback to AnnaSetu'}
        >
          <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center">
            <i className="fa-solid fa-star text-amber-400 text-xs group-hover:rotate-12 transition-transform" />
          </span>
          <span className="hidden sm:inline tracking-tight">
            {isMarathi ? 'अभिप्राय / रेटिंग द्या' : 'Feedback & Ratings'}
          </span>
          <span className="sm:hidden tracking-tight">
            {isMarathi ? 'अभिप्राय' : 'Feedback'}
          </span>
        </button>
      </div>

      <FeedbackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
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
