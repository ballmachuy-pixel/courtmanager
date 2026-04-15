import { describe, it, expect } from 'vitest';

describe('VNPay Webhook Security & Parsing', () => {
  it('should extract correct Payment ID from description', () => {
    const description = "Chuyen tien den so tai khoan XYZ - CM P A1B2C - Nguyen Van A";
    // Giả lập Regex mà chúng ta code
    const match = description.match(/CM P ([A-Za-z0-9]+)/);
    
    expect(match).not.toBeNull();
    expect(match?.[1]).toBe('A1B2C');
  });

  it('should ignore invalid formats', () => {
    const description = "Hoc phi thang 1 cho be";
    const match = description.match(/CM P ([A-Za-z0-9]+)/);
    
    expect(match).toBeNull();
  });
});
