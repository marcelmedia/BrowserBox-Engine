'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, RefreshCw, Users, Globe, Star, Filter } from 'lucide-react';
import { Button, MotionButton } from '@/components/ui/button';
import { MenuButton3D } from '@/components/main-menu/menu-button';

// Mock server data
const MOCK_SERVERS = [
  {
    id: '1',
    name: 'Sandbox Fun',
    players: 24,
    maxPlayers: 32,
    ping: 45,
    map: 'gm_construct',
    favorite: true,
  },
  {
    id: '2',
    name: 'Creative Build Server',
    players: 18,
    maxPlayers: 24,
    ping: 78,
    map: 'gm_flatgrass',
    favorite: false,
  },
  {
    id: '3',
    name: 'Roleplay World',
    players: 42,
    maxPlayers: 50,
    ping: 120,
    map: 'rp_downtown_v2',
    favorite: true,
  },
  {
    id: '4',
    name: 'Physics Playground',
    players: 12,
    maxPlayers: 24,
    ping: 35,
    map: 'gm_bigcity',
    favorite: false,
  },
  {
    id: '5',
    name: 'Workshop Creations',
    players: 8,
    maxPlayers: 16,
    ping: 62,
    map: 'workshop_test',
    favorite: false,
  },
];

// Version number in the GMod format
const VERSION = '0.0.1_prealpha_dev_280325_0058';

interface ServerBrowserProps {
  onClose: () => void;
}

export function ServerBrowser({ onClose }: ServerBrowserProps) {
  const [servers, setServers] = useState(MOCK_SERVERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleToggleFavorite = (id: string) => {
    setServers(prevServers =>
      prevServers.map(server =>
        server.id === id ? { ...server, favorite: !server.favorite } : server
      )
    );
  };

  const filteredServers = servers.filter(server =>
    server.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3,
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: 10,
      transition: { 
        duration: 0.2,
        ease: 'easeOut'
      }
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <motion.div 
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div 
        className="fixed inset-8 z-50 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 flex items-center justify-between bg-gradient-to-r from-blue-600/80 to-purple-600/80 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Server Browser</h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleRefresh}
              className="rounded-full bg-black/20 border-white/10 text-white hover:bg-white/20 hover:border-white/20"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={onClose}
              className="rounded-full bg-black/20 border-white/10 text-white hover:bg-white/20 hover:border-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 p-4 bg-black/30 border-b border-white/10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
            <input
              type="text"
              placeholder="Search servers..."
              className="w-full bg-black/30 border border-white/10 rounded-md pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2 bg-black/30 border-white/10 text-white hover:bg-blue-500/30 hover:border-white/20">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Server List */}
        <motion.div 
          className="flex-1 overflow-y-auto p-4 custom-scrollbar"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredServers.length === 0 ? (
            <motion.div 
              className="text-center py-12 text-muted-foreground"
              variants={itemVariants}
            >
              No servers found matching your search.
            </motion.div>
          ) : (
            filteredServers.map((server) => (
              <motion.div
                key={server.id}
                className={`mb-3 bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-black/40 hover:border-white/20 transition-colors cursor-pointer ${
                  selectedServer === server.id 
                    ? 'border-primary/70 border-opacity-100 bg-black/50' 
                    : 'border-opacity-50'
                }`}
                variants={itemVariants}
                onClick={() => setSelectedServer(server.id)}
                whileHover={{ 
                  x: 5, 
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)"
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{server.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(server.id);
                        }}
                        className="focus:outline-none"
                      >
                        <Star 
                          className={`h-4 w-4 ${
                            server.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'
                          }`} 
                        />
                      </button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="inline-flex items-center mr-4">
                        <Globe className="h-3.5 w-3.5 mr-1" /> 
                        {server.map}
                      </span>
                      <span className="inline-flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {server.players}/{server.maxPlayers}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`
                      ${server.ping < 50 ? 'text-green-400' : 
                        server.ping < 100 ? 'text-yellow-400' : 'text-red-400'}
                    `}>
                      {server.ping} ms
                    </span>
                    <button
                      className="mini-menu-button-3d flex justify-center items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle connect logic
                      }}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modal Footer */}
        <div className="bg-black/40 backdrop-blur-md p-4 border-t border-white/10 flex justify-end items-center">
          <div className="flex gap-3">
            <div className="w-28">
              <MenuButton3D onClick={onClose} centered={true}>
                Cancel
              </MenuButton3D>
            </div>
            <div className="w-28">
              <MenuButton3D 
                onClick={() => selectedServer && console.log('Connecting to server', selectedServer)} 
                disabled={!selectedServer} 
                centered={true}
              >
                Connect
              </MenuButton3D>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
} 