import React from 'react';

export const LanguageSwitcher: React.FC = () => {
  return (
    <div className="language-switcher">
      <select className="p-2 border rounded">
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
