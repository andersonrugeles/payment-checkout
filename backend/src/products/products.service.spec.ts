import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', () => {
      const products = service.findAll();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return products with required properties', () => {
      const products = service.findAll();
      const product = products[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('currency');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('stock');
      expect(product).toHaveProperty('category');
    });
  });

  describe('findOne', () => {
    it('should return a product by id', () => {
      const product = service.findOne('1');
      expect(product).toBeDefined();
      expect(product.id).toBe('1');
    });

    it('should throw NotFoundException for non-existent id', () => {
      expect(() => service.findOne('999')).toThrow(NotFoundException);
    });
  });

  describe('decreaseStock', () => {
    it('should decrease stock by the given quantity', () => {
      const initialProduct = service.findOne('1');
      const initialStock = initialProduct.stock;
      const result = service.decreaseStock('1', 2);
      expect(result.stock).toBe(initialStock - 2);
    });

    it('should throw when quantity exceeds available stock', () => {
      expect(() => service.decreaseStock('1', 9999)).toThrow(NotFoundException);
    });

    it('should throw for non-existent product', () => {
      expect(() => service.decreaseStock('999', 1)).toThrow(NotFoundException);
    });
  });

  describe('restoreStock', () => {
    it('should increase stock by the given quantity', () => {
      const initialProduct = service.findOne('1');
      const initialStock = initialProduct.stock;
      service.decreaseStock('1', 3);
      const result = service.restoreStock('1', 3);
      expect(result.stock).toBe(initialStock);
    });

    it('should throw for non-existent product', () => {
      expect(() => service.restoreStock('999', 1)).toThrow(NotFoundException);
    });
  });
});
