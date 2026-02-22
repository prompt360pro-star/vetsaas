import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';

describe('TemplatesService', () => {
  let service: TemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplatesService],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
  });

  describe('getAll', () => {
    it('should return all 7 templates', () => {
      const templates = service.getAll();
      expect(templates).toHaveLength(7);
    });

    it('should include consultation and emergency templates', () => {
      const templates = service.getAll();
      const ids = templates.map((t) => t.id);
      expect(ids).toContain('consultation');
      expect(ids).toContain('emergency');
      expect(ids).toContain('vaccination');
    });

    it('each template should have SOAP fields', () => {
      const templates = service.getAll();
      for (const t of templates) {
        expect(t.subjective).toBeDefined();
        expect(t.objective).toBeDefined();
        expect(t.assessment).toBeDefined();
        expect(t.plan).toBeDefined();
      }
    });
  });

  describe('getById', () => {
    it('should return a template by ID', () => {
      const template = service.getById('consultation');
      expect(template).toBeDefined();
      expect(template?.name).toBe('Consulta Geral');
    });

    it('should return undefined for unknown ID', () => {
      const template = service.getById('unknown');
      expect(template).toBeUndefined();
    });
  });

  describe('getByCategory', () => {
    it('should filter by category', () => {
      const surgical = service.getByCategory('SURGICAL');
      expect(surgical).toHaveLength(2);
      expect(surgical.every((t) => t.category === 'SURGICAL')).toBe(true);
    });

    it('should return empty for unknown category', () => {
      const result = service.getByCategory('NONEXISTENT');
      expect(result).toHaveLength(0);
    });
  });
});
