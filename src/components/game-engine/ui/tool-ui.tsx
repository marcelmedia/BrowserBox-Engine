'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolUIProps } from '../types/game-types';

// Tool categories and their tools
const TOOL_CATEGORIES = [
  {
    name: 'Tools',
    items: [
      { id: 'physics-gun', name: 'Physics Gun', icon: '🔨', description: 'Manipulate objects with physics' },
      { id: 'tool-gun', name: 'Tool Gun', icon: '🔧', description: 'Create and modify contraptions' },
      { id: 'camera', name: 'Camera', icon: '📷', description: 'Take screenshots' },
      { id: 'rope', name: 'Rope', icon: '🧵', description: 'Connect objects with rope' }
    ]
  },
  {
    name: 'Props',
    items: [
      { id: 'furniture', name: 'Furniture', icon: '🪑', description: 'Add furniture to your world' },
      { id: 'vehicles', name: 'Vehicles', icon: '🚗', description: 'Vehicles you can drive' },
      { id: 'weapons', name: 'Weapons', icon: '🔫', description: 'Arm yourself with weapons' },
      { id: 'construction', name: 'Construction', icon: '🧱', description: 'Building blocks and materials' }
    ]
  },
  {
    name: 'World',
    items: [
      { id: 'weather', name: 'Weather', icon: '☀️', description: 'Change the weather' },
      { id: 'time', name: 'Time', icon: '🕐', description: 'Control the time of day' },
      { id: 'npc', name: 'NPCs', icon: '👤', description: 'Spawn characters' },
      { id: 'effects', name: 'Effects', icon: '✨', description: 'Add special effects' }
    ]
  }
];

export function ToolUI() {
  const [toolsVisible, setToolsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tools');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [tooltipTool, setTooltipTool] = useState<string | null>(null);
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'q' || e.key === 'Q') {
        setToolsVisible(prev => !prev);
      }
      
      // Number keys to quickly select categories
      if (e.key >= '1' && e.key <= '3' && toolsVisible) {
        const index = parseInt(e.key) - 1;
        if (index >= 0 && index < TOOL_CATEGORIES.length) {
          setSelectedCategory(TOOL_CATEGORIES[index].name);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toolsVisible]);
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    // Here you would implement the actual tool selection logic
    console.log(`Selected tool: ${toolId}`);
  };
  
  return (
    <AnimatePresence>
      {toolsVisible && (
        <motion.div 
          className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-lg text-white border border-white/10 w-[340px]"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          {/* Category tabs */}
          <div className="flex border-b border-white/20 mb-3">
            {TOOL_CATEGORIES.map((category, index) => (
              <button 
                key={category.name}
                className={`flex-1 py-2 px-1 text-sm font-medium relative ${
                  selectedCategory === category.name 
                    ? 'text-blue-400' 
                    : 'text-white/70 hover:text-white'
                }`}
                onClick={() => handleCategoryClick(category.name)}
              >
                {category.name}
                {selectedCategory === category.name && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                    layoutId="categoryIndicator"
                  />
                )}
                <span className="absolute top-0 right-1 text-xs opacity-50">{index + 1}</span>
              </button>
            ))}
          </div>
          
          {/* Tools grid */}
          <div className="grid grid-cols-2 gap-2">
            {TOOL_CATEGORIES.find(c => c.name === selectedCategory)?.items.map(tool => (
              <motion.button
                key={tool.id}
                className={`bg-gray-800/60 hover:bg-gray-700/70 rounded p-2 flex items-center gap-2 relative ${
                  selectedTool === tool.id ? 'ring-1 ring-blue-500 bg-blue-900/30' : ''
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleToolClick(tool.id)}
                onMouseEnter={() => setTooltipTool(tool.id)}
                onMouseLeave={() => setTooltipTool(null)}
              >
                <span className="text-lg">{tool.icon}</span>
                <span className="text-sm truncate">{tool.name}</span>
                
                {/* Tooltip */}
                <AnimatePresence>
                  {tooltipTool === tool.id && (
                    <motion.div
                      className="absolute bottom-full left-0 mb-2 p-2 bg-gray-900 rounded text-xs max-w-[200px] z-10"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                    >
                      {tool.description}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-white/50">
            <span>Selected: {TOOL_CATEGORIES.find(c => c.name === selectedCategory)?.items.find(t => t.id === selectedTool)?.name || 'None'}</span>
            <span>Press Q to close</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 