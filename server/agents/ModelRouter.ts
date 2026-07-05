import { GoogleGenAI } from '@google/genai';

/**
 * ModelRouter — Automatic Model Failover System
 * 
 * When a model hits rate limits (429) or quota exhaustion, the router
 * automatically retries with the next available model in the priority chain.
 * 
 * Priority order:
 * 1. GEMINI_TUNED_MODEL_NAME (if set — your fine-tuned model)
 * 2. gemini-2.0-flash        (primary — highest free-tier limits)
 * 3. gemini-2.5-flash        (backup — good quality)
 * 4. gemini-1.5-flash        (last resort — very high limits)
 */

const MODEL_CHAIN = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest'
];

export class ModelRouter {
  private ai: GoogleGenAI;
  private currentModelIndex = 0;
  private rateLimitedModels: Map<string, number> = new Map(); // model → cooldown timestamp
  private useTunedModel: boolean;

  constructor(apiKey: string, useTunedModel: boolean = false) {
    this.ai = new GoogleGenAI({ apiKey });
    this.useTunedModel = useTunedModel;
  }

  /**
   * Returns the full ordered list of models to try, starting with the tuned model if configured.
   */
  private getModelChain(): string[] {
    const chain: string[] = [];
    
    // Highest priority: user's fine-tuned model (only if requested by this agent)
    const tuned = process.env.GEMINI_TUNED_MODEL_NAME;
    if (this.useTunedModel && tuned) chain.push(tuned);

    // User-configured model from .env
    const envModel = process.env.GEMINI_MODEL;
    if (envModel && !chain.includes(envModel)) chain.push(envModel);

    // Default chain
    for (const m of MODEL_CHAIN) {
      if (!chain.includes(m)) chain.push(m);
    }

    return chain;
  }

  /**
   * Selects the best available model (skipping rate-limited ones).
   */
  private selectModel(): string {
    const chain = this.getModelChain();
    const now = Date.now();

    for (const model of chain) {
      const cooldownUntil = this.rateLimitedModels.get(model) || 0;
      if (now > cooldownUntil) {
        return model;
      }
    }

    // All rate-limited — return the one with shortest remaining cooldown
    let bestModel = chain[0];
    let shortestWait = Infinity;
    for (const model of chain) {
      const wait = (this.rateLimitedModels.get(model) || 0) - now;
      if (wait < shortestWait) {
        shortestWait = wait;
        bestModel = model;
      }
    }
    return bestModel;
  }

  /**
   * Calls generateContent with automatic model failover.
   * If a model returns 429, it's put on a 60s cooldown and the next model is tried.
   */
  async generateContent(params: {
    contents: string;
    config?: any;
  }): Promise<any> {
    const chain = this.getModelChain();
    const now = Date.now();
    const errors: string[] = [];

    for (const model of chain) {
      const cooldownUntil = this.rateLimitedModels.get(model) || 0;
      if (now < cooldownUntil) {
        console.log(`[ModelRouter] Skipping ${model} — rate-limited for ${Math.ceil((cooldownUntil - now) / 1000)}s more`);
        continue;
      }

      try {
        console.log(`[ModelRouter] Trying model: ${model}`);
        const response = await this.ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (error: any) {
        const status = error?.status || error?.code;
        
        if (status === 429 || (error?.message && error.message.includes('RESOURCE_EXHAUSTED'))) {
          // Rate limited — put on 60s cooldown
          const cooldownMs = this.extractRetryDelay(error) || 60_000;
          this.rateLimitedModels.set(model, Date.now() + cooldownMs);
          console.warn(`[ModelRouter] ${model} rate-limited. Cooldown ${cooldownMs / 1000}s. Trying next model...`);
          errors.push(`${model}: 429`);
          continue;
        }

        // Non-rate-limit error — throw immediately
        throw error;
      }
    }

    // All models exhausted
    throw new Error(`[ModelRouter] All models exhausted. Errors: ${errors.join(', ')}`);
  }

  /**
   * Extracts the retry delay from the error response if present.
   */
  private extractRetryDelay(error: any): number | null {
    try {
      const msg = error?.message || '';
      const match = msg.match(/retryDelay.*?(\d+\.?\d*)s/i);
      if (match) return Math.ceil(parseFloat(match[1]) * 1000);
    } catch {}
    return null;
  }

  /**
   * Returns current status info for debugging/UI.
   */
  getStatus() {
    const now = Date.now();
    const chain = this.getModelChain();
    return chain.map(model => ({
      model,
      available: now > (this.rateLimitedModels.get(model) || 0),
      cooldownRemaining: Math.max(0, (this.rateLimitedModels.get(model) || 0) - now),
    }));
  }
}
