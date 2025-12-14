import { GoogleGenAI } from "@google/genai";
import { MarketData, MarketBias, PtaxZone } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const getAnalystInsight = async (
  marketData: MarketData,
  bias: MarketBias,
  ptaxZones: PtaxZone[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key não configurada.";

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

export const analyzeChartImages = async (
  dailyChartBase64: string | null,
  intradayChartBase64: string | null
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Key não configurada. Adicione sua chave para analisar gráficos.";

  if (!dailyChartBase64 && !intradayChartBase64) {
    return "Nenhum gráfico fornecido para análise.";
  }

  const parts: any[] = [];

  if (dailyChartBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: dailyChartBase64.split(',')[1] // Remove data:image/png;base64, prefix
      }
    });
  }

  if (intradayChartBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: intradayChartBase64.split(',')[1]
      }
    });
  }

  const prompt = `
    Você é um especialista em Leitura de Fluxo (Tape Reading) e Análise Técnica para Dólar Futuro (WDO/DOL).
    Analise as imagens dos gráficos fornecidos (Diário e/ou Intraday) referente ao fechamento anterior ou movimento recente.
    
    OBJETIVO PRINCIPAL:
    Identificar onde os GRANDES PLAYERS (Institucionais) estão posicionados.
    
    1. Identifique zonas de alta negociação (Volume Profile / Consolidações).
    2. Estime a faixa de preço do "Médio" dos comprados e vendidos.
    3. Marque suportes e resistências relevantes para o dia de hoje.
    4. Se houver VWAP visível, comente sua importância.
    
    Saída esperada:
    - Um resumo em tópicos (bullets).
    - Linguagem profissional de trading (ex: "Defesa compradora no 5000", "Vendedores presos no topo").
    - Conclusão: Onde está a maior liquidez e para onde o mercado tende a ir se romper essas zonas.
  `;

  parts.push({ text: prompt });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });
    return response.text || "Não foi possível analisar os gráficos.";
  } catch (error) {
    console.error("Erro ao analisar imagens:", error);
    return "Erro ao processar imagens. Verifique se o formato é válido.";
  }
};