/**
 * Service to modify scripts based on persona
 * This uses simple heuristics, but could be enhanced with LLM in the future
 */

interface PersonaModifiers {
  formality: string;
  emotion: string;
  length: string;
  vocabulary: string;
}

export class ScriptModifier {
  /**
   * Modify a script based on persona characteristics
   */
  static modifyScript(
    script: string,
    personaName: string,
    modifiers: PersonaModifiers
  ): string {
    let modifiedScript = script;

    // Apply formality modifications
    if (modifiers.formality === 'high') {
      modifiedScript = this.increaseFormalitY(modifiedScript);
    } else if (modifiers.formality === 'low') {
      modifiedScript = this.decreaseFormality(modifiedScript);
    }

    // Apply emotion modifications
    if (modifiers.emotion === 'high') {
      modifiedScript = this.increaseEmotion(modifiedScript);
    } else if (modifiers.emotion === 'low') {
      modifiedScript = this.decreaseEmotion(modifiedScript);
    }

    // Apply length modifications
    if (modifiers.length === 'concise') {
      modifiedScript = this.makeConcise(modifiedScript);
    }

    return modifiedScript;
  }

  private static increaseFormalitY(script: string): string {
    return script
      .replace(/I'm/g, 'I am')
      .replace(/don't/g, 'do not')
      .replace(/can't/g, 'cannot')
      .replace(/won't/g, 'will not')
      .replace(/\bwant to\b/g, 'would like to')
      .replace(/\bask that you\b/g, 'respectfully request that you');
  }

  private static decreaseFormality(script: string): string {
    return script
      .replace(/I am calling/g, "I'm calling")
      .replace(/I am a/g, "I'm a")
      .replace(/do not/g, "don't")
      .replace(/cannot/g, "can't");
  }

  private static increaseEmotion(script: string): string {
    return script
      .replace(/I urge/g, 'I strongly urge')
      .replace(/support/g, 'strongly support')
      .replace(/important/g, 'critically important')
      .replace(/need/g, 'desperately need')
      .replace(/\. /g, '! ');
  }

  private static decreaseEmotion(script: string): string {
    return script
      .replace(/strongly /g, '')
      .replace(/desperately /g, '')
      .replace(/!/g, '.');
  }

  private static makeConcise(script: string): string {
    // Remove some filler phrases to make more concise
    return script
      .replace(/I want to express my /g, 'I ')
      .replace(/I would like to /g, 'I ')
      .replace(/\bvery\b/g, '')
      .replace(/  +/g, ' '); // Remove double spaces
  }

  /**
   * Replace placeholder variables in script
   */
  static replacePlaceholders(
    script: string,
    variables: Record<string, string>
  ): string {
    let result = script;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `[${key}]`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
  }
}
