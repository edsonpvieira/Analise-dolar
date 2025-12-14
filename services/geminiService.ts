import { GoogleGenAI } from "@google/genai";
import { MarketData, MarketBias, PtaxZone } from "../types";

export const getAnalystInsight = async (
  marketData: MarketData,
  bias: MarketBias,
  ptaxZones: PtaxZone[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "API Key não configurada. Adicione sua chave do Gemini para receber insights.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Atue como um analista senior de Day Trade de Dólar Futuro (B3).
    Analise os dados abaixo e forneça um resumo curto (max 2 parágrafos) e objetivo para o trader.
    Seja direto, evite "financês" complexo. Fale sobre sentimento e cautela.
    
    Dados atuais:
    - Preço: ${marketData.price}
    - VWAP: ${marketData.vwap}
    - Agressão Compra: ${marketData.aggressionBuy}%
    - Agressão Venda: ${marketData.aggressionSell}%
    - Viés Calculado: ${bias}
    - Máxima Dia: ${marketData.high}
    - Mínima Dia: ${marketData.low}
    
    Zonas PTAX Relevantes:
    ${ptaxZones.map(z => `- ${z.timeLabel}: ${z.price.toFixed(1)} (${z.type})`).join('\n')}

    Dê uma recomendação psicológica rápida de gestão de risco.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Sem análise disponível no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
    return "Não foi possível conectar ao analista IA no momento.";
  }
};