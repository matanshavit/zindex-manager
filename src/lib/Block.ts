import * as THREE from 'three';
import { ZIndexManager } from './ZIndexManager';

export class Block {
  private mesh: THREE.Mesh;
  private id: string;
  private static zIndexManager = ZIndexManager.getInstance();

  constructor(position: THREE.Vector3, size: number = 1) {
    this.id = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const geometry = new THREE.PlaneGeometry(size, size);
    
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    const gradient = ctx.createLinearGradient(0, 0, 256, 256);
    const colors = this.generateGradientColors();
    gradient.addColorStop(0, colors.start);
    gradient.addColorStop(1, colors.end);
    
    this.drawRoundedRect(ctx, 12, 12, 232, 232, 24, gradient);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    this.strokeRoundedRect(ctx, 12, 12, 232, 232, 24);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthTest: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    
    // Initialize z-index management
    this.assignZIndex();
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  getZIndex(): number {
    return Block.zIndexManager.getZIndex(this.id);
  }

  updateRenderOrder(): void {
    const renderOrder = Block.zIndexManager.getRenderOrder(this.id);
    this.mesh.renderOrder = renderOrder;
  }

  assignZIndex(): void {
    Block.zIndexManager.moveToFront(this.id);
    this.updateRenderOrder();
  }

  bringToFront(): void {
    Block.zIndexManager.moveToFront(this.id);
    this.updateRenderOrder();
  }

  setRenderOrder(order: number): void {
    this.mesh.renderOrder = order;
  }

  getId(): string {
    return this.id;
  }

  private generateGradientColors(): { start: string; end: string } {
    const strategy = Math.random();
    
    if (strategy < 0.25) {
      const hue1 = Math.random() * 360;
      const hue2 = (hue1 + 180) % 360;
      const start = `hsl(${hue1}, ${80 + Math.random() * 20}%, ${50 + Math.random() * 20}%)`;
      const end = `hsl(${hue2}, ${70 + Math.random() * 25}%, ${30 + Math.random() * 30}%)`;
      return { start, end };
    } else if (strategy < 0.5) {
      const hue1 = Math.random() * 360;
      const hue2 = (hue1 + 120 + Math.random() * 30) % 360;
      const start = `hsl(${hue1}, ${85 + Math.random() * 15}%, ${60 + Math.random() * 15}%)`;
      const end = `hsl(${hue2}, ${75 + Math.random() * 20}%, ${35 + Math.random() * 25}%)`;
      return { start, end };
    } else if (strategy < 0.75) {
      const hue1 = Math.random() * 360;
      const hue2 = (hue1 + 30 + Math.random() * 60) % 360;
      const start = `hsl(${hue1}, ${90 + Math.random() * 10}%, ${65 + Math.random() * 20}%)`;
      const end = `hsl(${hue2}, ${85 + Math.random() * 15}%, ${25 + Math.random() * 35}%)`;
      return { start, end };
    } else {
      const hue = Math.random() * 360;
      const sat1 = 80 + Math.random() * 20;
      const sat2 = 60 + Math.random() * 30;
      const light1 = 70 + Math.random() * 20;
      const light2 = 20 + Math.random() * 40;
      const start = `hsl(${hue}, ${sat1}%, ${light1}%)`;
      const end = `hsl(${hue}, ${sat2}%, ${light2}%)`;
      return { start, end };
    }
  }

  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  private strokeRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  }

  dispose(): void {
    Block.zIndexManager.removeBlock(this.id);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
