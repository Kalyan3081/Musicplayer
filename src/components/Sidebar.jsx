import React from 'react';
import Logo from './Logo';
import { categories } from '../data/tracks';

const Sidebar = ({ activeCategory, setActiveCategory, themeColor }) => {

  return (
    <div className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div>
        <Logo customColor={themeColor} />
        <ul className="menu">
          {categories.map((category) => (
            <li
              key={category.id}
              className={`menu-item ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="menu-text">{category.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="avatar-container" style={{ 
        marginTop: 'auto', 
        padding: '16px', 
        display: 'flex', 
        alignItems: 'center',
      }}>
        <div className="avatar" style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: themeColor || '#6c5ce7', 
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          marginRight: '12px'
        }}>
          U
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 