import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonActionProps {
  label: string;
  onClick: () => void;
  variant?: 'success' | 'danger' | 'neutral' | 'outline';
  icon?: LucideIcon;
}

export function ButtonAction({ 
  label, 
  onClick, 
  variant = 'neutral', 
  icon: Icon 
}: ButtonActionProps) {

  const variants = {
    success: "bg-green-600 hover:bg-green-700 text-white shadow-green-900/20", // Para ACERTOS
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-900/20",        // Para ERROS
    neutral: "bg-slate-800 hover:bg-slate-700 text-white shadow-slate-900/20", // Para AÇÕES (Rebote, Assist)
    outline: "border-2 border-slate-300 text-slate-600 hover:bg-slate-50"       // Para CANCELAR/VOLTAR
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${variants[variant]}
        w-full          
        h-14 
        rounded-xl
        font-bold text-lg
        shadow-lg
        active:scale-95
        transition-all duration-100
        flex items-center justify-center gap-2
      `}
    >
      {Icon && <Icon size={20} />} {}
      <span>{label}</span>
    </button>
  );
}