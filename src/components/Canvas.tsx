'use client';

import { Canvas as ThreeCanvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { useState, useCallback } from 'react';
import { Block } from '@/lib/Block';
import { ZIndexManager } from '@/lib/ZIndexManager';
import * as THREE from 'three';

function InteractiveBlock({ 
  block, 
  onUpdate 
}: { 
  block: Block; 
  onUpdate: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);
    
    document.body.style.cursor = 'grabbing';
    
    block.bringToFront();
    onUpdate();
  }, [block, onUpdate]);

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    
    const worldPos = event.point;
    if (worldPos) {
      block.getMesh().position.x = worldPos.x;
      block.getMesh().position.y = worldPos.y;
      block.getMesh().position.z = 0;
      onUpdate();
    }
  }, [isDragging, block, onUpdate]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    
    document.body.style.cursor = isHovered ? 'grab' : 'default';
  }, [isHovered]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
    if (!isDragging) {
      document.body.style.cursor = 'grab';
    }
  }, [isDragging]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (!isDragging) {
      document.body.style.cursor = 'default';
    }
  }, [isDragging]);

  useFrame(() => {
    if (isDragging) {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const handleGlobalPointerUp = () => {
          setIsDragging(false);
          document.body.style.cursor = 'default';
        };
        canvas.addEventListener('pointerup', handleGlobalPointerUp);
        canvas.addEventListener('pointerleave', handleGlobalPointerUp);
        
        return () => {
          canvas.removeEventListener('pointerup', handleGlobalPointerUp);
          canvas.removeEventListener('pointerleave', handleGlobalPointerUp);
        };
      }
    }
  });

  return (
    <primitive 
      object={block.getMesh()} 
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    />
  );
}

function InteractiveBlocks({ blocks, onBlockUpdate }: { 
  blocks: Block[], 
  onBlockUpdate: (blocks: Block[]) => void 
}) {
  const handleUpdate = useCallback(() => {
    // Update render order for all blocks
    blocks.forEach(block => {
      block.updateRenderOrder();
    });
    
    onBlockUpdate([...blocks]);
  }, [blocks, onBlockUpdate]);

  return (
    <>
      {blocks.map((block, index) => (
        <InteractiveBlock 
          key={index} 
          block={block} 
          onUpdate={handleUpdate}
        />
      ))}
    </>
  );
}

export default function Canvas() {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const addBlock = () => {
    const newBlock = new Block(
      new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8, // Random Y position
        0
      ),
      2.5 // Bigger block size
    );
    
    setBlocks(prev => [...prev, newBlock]);
  };

  const removeAllBlocks = () => {
    blocks.forEach(block => block.dispose());
    setBlocks([]);
    ZIndexManager.getInstance().reset();
  };

  const handleBlockUpdate = useCallback((updatedBlocks: Block[]) => {
    setBlocks(updatedBlocks);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-4">2D Z-Index Challenge</h1>
        <div className="flex gap-4">
          <button
            onClick={addBlock}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Add Block
          </button>
          <button
            onClick={removeAllBlocks}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Clear All
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-300">
          Blocks added: {blocks.length}
        </p>
      </div>
      
      <div className="flex-1">
        <ThreeCanvas
          camera={{ position: [0, 0, 15], fov: 50 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000);
          }}
        >
          <ambientLight intensity={0.8} />
          
          <InteractiveBlocks blocks={blocks} onBlockUpdate={handleBlockUpdate} />
        </ThreeCanvas>
      </div>
    </div>
  );
}
