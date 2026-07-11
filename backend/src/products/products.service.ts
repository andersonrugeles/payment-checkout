import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Audífonos Inalámbricos',
      description: 'Audífonos premium con cancelación de ruido y 30h de batería',
      price: 25000000, // $250,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      stock: 15,
      category: 'Electrónica',
    },
    {
      id: '2',
      name: 'Reloj Inteligente',
      description: 'Monitor de actividad física con sensor cardíaco y GPS',
      price: 18000000, // $180,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      stock: 20,
      category: 'Electrónica',
    },
    {
      id: '3',
      name: 'Parlante Portátil',
      description: 'Parlante bluetooth resistente al agua con sonido 360°',
      price: 12000000, // $120,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      stock: 30,
      category: 'Electrónica',
    },
    {
      id: '4',
      name: 'Soporte para Laptop',
      description: 'Soporte ergonómico de aluminio con altura ajustable',
      price: 8500000, // $85,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
      stock: 25,
      category: 'Accesorios',
    },
    {
      id: '5',
      name: 'Teclado Mecánico',
      description: 'Teclado mecánico RGB con switches Cherry MX',
      price: 35000000, // $350,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
      stock: 10,
      category: 'Electrónica',
    },
    {
      id: '6',
      name: 'Hub USB-C',
      description: 'Hub USB-C 7 en 1 con HDMI, lector SD y Ethernet',
      price: 9500000, // $95,000 COP
      currency: 'COP',
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400',
      stock: 40,
      category: 'Accesorios',
    },
  ];

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  decreaseStock(id: string, quantity: number): Product {
    const product = this.findOne(id);
    if (product.stock < quantity) {
      throw new NotFoundException(
        `Insufficient stock for product ${id}. Available: ${product.stock}`,
      );
    }
    product.stock -= quantity;
    return product;
  }

  restoreStock(id: string, quantity: number): Product {
    const product = this.findOne(id);
    product.stock += quantity;
    return product;
  }
}
