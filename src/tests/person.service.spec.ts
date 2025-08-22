import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonService } from '../services/person.service';
import { Person } from '../entities/person.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockPersonRepository = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('PersonService', () => {
  let service: PersonService;
  let repository: Repository<Person>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: mockPersonRepository,
        },
      ],
    }).compile();

    service = module.get<PersonService>(PersonService);
    repository = module.get<Repository<Person>>(getRepositoryToken(Person));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateQR', () => {
    it('should generate QR code for existing person', async () => {
      const mockPerson = {
        ci: 9090909,
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
        apellido_materno: 'García',
        wallet_address: null,
      };

      mockPersonRepository.findOne.mockResolvedValue(mockPerson);

      const result = await service.generateQR(9090909);

      expect(result).toHaveProperty('qr_code');
      expect(result).toHaveProperty('hash');
      expect(result).toHaveProperty('ci');
      expect(result.ci).toBe(9090909);
      expect(typeof result.hash).toBe('string');
      expect(result.qr_code).toMatch(/^data:image\/png;base64,/);
    });

    it('should throw NotFoundException for non-existing person', async () => {
      mockPersonRepository.findOne.mockResolvedValue(null);

      await expect(service.generateQR(9999999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addWalletAddress', () => {
    it('should add wallet address to existing person', async () => {
      const mockPerson = {
        ci: 9090909,
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
        apellido_materno: 'García',
        wallet_address: null,
      };

      const updatedPerson = {
        ...mockPerson,
        wallet_address: '0x1234567890123456789012345678901234567890',
      };

      mockPersonRepository.findOne.mockResolvedValue(mockPerson);
      mockPersonRepository.save.mockResolvedValue(updatedPerson);

      const result = await service.addWalletAddress(
        9090909,
        '0x1234567890123456789012345678901234567890',
      );

      expect(result.message).toContain('exitosamente');
      expect(result.person.wallet_address).toBe('0x1234567890123456789012345678901234567890');
    });

    it('should throw BadRequestException for invalid wallet format', async () => {
      const mockPerson = {
        ci: 9090909,
        nombre: 'Juan',
        apellido_paterno: 'Pérez',
        apellido_materno: 'García',
        wallet_address: null,
      };

      mockPersonRepository.findOne.mockResolvedValue(mockPerson);

      await expect(
        service.addWalletAddress(9090909, 'invalid-wallet'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
