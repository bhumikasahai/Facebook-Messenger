//Themes
import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.getElementById('root');
    if (darkMode) {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(prev => !prev);

  return (
    <div style={{ position: 'absolute', top: 20, right: 20 }}>
      <button
        onClick={toggleTheme}
        style={{
          padding: '10px 20px',
          backgroundColor: darkMode ? '#fff' : '#333',
          color: darkMode ? '#000' : '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
};

export default ThemeToggle;
