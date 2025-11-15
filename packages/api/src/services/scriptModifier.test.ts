import { ScriptModifier } from './scriptModifier';

describe('ScriptModifier', () => {
  describe('modifyScript', () => {
    const baseScript = "Hello, I'm calling to ask that you support this bill. I want to express my support.";

    it('should increase formality when formality is high', () => {
      const result = ScriptModifier.modifyScript(baseScript, 'Professional', {
        formality: 'high',
        emotion: 'low',
        length: 'moderate',
        vocabulary: 'formal'
      });

      expect(result).toContain('I am calling');
      expect(result).not.toContain("I'm calling");
      expect(result).toContain('would like to');
    });

    it('should decrease formality when formality is low', () => {
      const formalScript = 'I am calling to say I do not support this.';
      const result = ScriptModifier.modifyScript(formalScript, 'Casual', {
        formality: 'low',
        emotion: 'low',
        length: 'moderate',
        vocabulary: 'accessible'
      });

      expect(result).toContain("I'm calling");
      expect(result).toContain("don't");
    });

    it('should increase emotion when emotion is high', () => {
      const result = ScriptModifier.modifyScript(
        'I urge you to support this important bill.',
        'Passionate',
        {
          formality: 'medium',
          emotion: 'high',
          length: 'moderate',
          vocabulary: 'accessible'
        }
      );

      expect(result).toContain('strongly urge');
      expect(result).toContain('critically important');
    });

    it('should make script concise when length is concise', () => {
      const verboseScript = 'I want to express my support for this very important bill.';
      const result = ScriptModifier.modifyScript(verboseScript, 'Professional', {
        formality: 'high',
        emotion: 'low',
        length: 'concise',
        vocabulary: 'formal'
      });

      expect(result).not.toContain('I want to express my');
      expect(result).not.toContain('very');
    });
  });

  describe('replacePlaceholders', () => {
    it('should replace all placeholders with provided values', () => {
      const script = 'Hello [REPRESENTATIVE_NAME], I am [CALLER_NAME] from [LOCATION].';
      const result = ScriptModifier.replacePlaceholders(script, {
        REPRESENTATIVE_NAME: 'Senator Smith',
        CALLER_NAME: 'John Doe',
        LOCATION: 'California'
      });

      expect(result).toBe('Hello Senator Smith, I am John Doe from California.');
    });

    it('should replace multiple occurrences of the same placeholder', () => {
      const script = '[NAME] is calling. [NAME] lives here.';
      const result = ScriptModifier.replacePlaceholders(script, {
        NAME: 'Jane'
      });

      expect(result).toBe('Jane is calling. Jane lives here.');
    });

    it('should leave unreplaced placeholders unchanged', () => {
      const script = 'Hello [NAME], you live in [CITY].';
      const result = ScriptModifier.replacePlaceholders(script, {
        NAME: 'Jane'
      });

      expect(result).toBe('Hello Jane, you live in [CITY].');
    });
  });
});
