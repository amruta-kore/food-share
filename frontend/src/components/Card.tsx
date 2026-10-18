import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="rounded-lg shadow-md bg-white p-4 m-2">
    <h2 className="text-xl font-semibold mb-2">{title}</h2>
    <div>{children}</div>
  </div>
);

export default Card;
