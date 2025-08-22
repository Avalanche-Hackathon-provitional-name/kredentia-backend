import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptographyService {
  constructor(private configService: ConfigService) {}

  /**
   * Genera un hash SHA-256 con salt para mayor seguridad
   */
  generateSecureHash(data: string, salt?: string): string {
    const saltToUse = salt || crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(data + saltToUse);
    return hash.digest('hex');
  }

  /**
   * Genera un hash compatible con Zero-Knowledge proofs
   */
  generateZKHash(data: string): { hash: string; commitment: string; nullifier: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.generateSecureHash(data, salt);
    
    // Simulated ZK commitment and nullifier for demo
    const commitment = crypto.createHash('sha256').update(`commitment_${hash}`).digest('hex');
    const nullifier = crypto.createHash('sha256').update(`nullifier_${hash}`).digest('hex');
    
    return { hash, commitment, nullifier };
  }

  /**
   * Encripta datos usando AES-256-GCM
   */
  encryptData(data: string, key?: string): { encrypted: string; iv: string; key: string; tag: string } {
    const encryptionKey = key ? Buffer.from(key, 'hex') : crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      key: encryptionKey.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Desencripta datos usando AES-256-GCM
   */
  decryptData(encryptedData: string, key: string, iv: string, tag: string): string {
    const keyBuffer = Buffer.from(key, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const tagBuffer = Buffer.from(tag, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
    decipher.setAuthTag(tagBuffer);
    
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Genera una prueba ZK simulada (para demo purposes)
   */
  generateZKProof(secret: string, publicSignal: string): {
    proof: string;
    publicSignals: string[];
    verified: boolean;
  } {
    // En una implementación real, esto usaría librerías como snarkjs
    const proofData = {
      a: [crypto.randomBytes(32).toString('hex'), crypto.randomBytes(32).toString('hex')],
      b: [[crypto.randomBytes(32).toString('hex'), crypto.randomBytes(32).toString('hex')], 
          [crypto.randomBytes(32).toString('hex'), crypto.randomBytes(32).toString('hex')]],
      c: [crypto.randomBytes(32).toString('hex'), crypto.randomBytes(32).toString('hex')]
    };

    return {
      proof: JSON.stringify(proofData),
      publicSignals: [publicSignal],
      verified: true // Simulado para demo
    };
  }

  /**
   * Verifica una prueba ZK
   */
  verifyZKProof(proof: string, publicSignals: string[]): boolean {
    // En una implementación real, esto verificaría la prueba usando el verification key
    try {
      JSON.parse(proof);
      return true; // Simulado para demo
    } catch {
      return false;
    }
  }

  /**
   * Valida un hash ZK
   */
  validateZKHash(zkHash: string): { valid: boolean; reason?: string } {
    try {
      if (!zkHash || zkHash.length < 10) {
        return { valid: false, reason: 'Hash ZK muy corto' };
      }
      
      if (!zkHash.startsWith('zk_')) {
        return { valid: false, reason: 'Formato de hash ZK inválido' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Genera un commitment ZK para un token
   */
  generateZKCommitment(tokenId: string, address: string): string {
    try {
      const data = `${tokenId}_${address}_${Date.now()}`;
      const hash = crypto.createHash('sha256').update(data).digest('hex');
      return `commitment_${hash.substring(0, 32)}`;
    } catch (error) {
      throw new Error(`Error generando commitment ZK: ${error.message}`);
    }
  }
}
