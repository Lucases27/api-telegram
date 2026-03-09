import { jest, describe, it, expect } from '@jest/globals';

/**
 * Validation tests for request body formats.
 * These are pure logic tests, no DB or Firebase required.
 */

function validateReservationBody(body: any): string | null {
  if (!body.restaurantId) return 'restaurantId es requerido';
  if (!body.name) return 'name es requerido';
  if (!body.date) return 'date es requerido';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return 'date debe tener formato YYYY-MM-DD';
  return null;
}

function validateRegisterBody(body: any): string | null {
  if (!body.name || body.name.trim() === '') return 'name es requerido';
  return null;
}

function validateChatBody(body: any): string | null {
  if (!body.message || body.message.trim() === '') return 'message es requerido';
  return null;
}

describe('Validación de datos – Unit Tests', () => {
  describe('validateReservationBody', () => {
    it('1. Falla si falta restaurantId', () => {
      expect(validateReservationBody({ name: 'Juan', date: '2026-03-01' })).toBeTruthy();
    });

    it('2. Falla si falta name', () => {
      expect(validateReservationBody({ restaurantId: 1, date: '2026-03-01' })).toBeTruthy();
    });

    it('3. Falla si falta date', () => {
      expect(validateReservationBody({ restaurantId: 1, name: 'Juan' })).toBeTruthy();
    });

    it('4. Falla si date tiene formato incorrecto', () => {
      expect(validateReservationBody({ restaurantId: 1, name: 'Juan', date: '01/03/2026' })).toBeTruthy();
    });

    it('5. Pasa si todos los campos son válidos', () => {
      expect(validateReservationBody({ restaurantId: 1, name: 'Juan', date: '2026-03-01' })).toBeNull();
    });
  });

  describe('validateRegisterBody', () => {
    it('6. Falla si falta name en el body de registro', () => {
      expect(validateRegisterBody({})).toBeTruthy();
    });

    it('7. Falla si name es un string vacío', () => {
      expect(validateRegisterBody({ name: '   ' })).toBeTruthy();
    });

    it('8. Pasa si name está presente', () => {
      expect(validateRegisterBody({ name: 'María García' })).toBeNull();
    });
  });

  describe('validateChatBody', () => {
    it('9. Falla si falta message', () => {
      expect(validateChatBody({})).toBeTruthy();
    });

    it('10. Pasa si message tiene contenido',() => {
      expect(validateChatBody({ message: 'Listame las reservas' })).toBeNull();
    });
  });
});
