import { Injectable } from "@nestjs/common";

export interface ClinicalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  defaultVitals: string[];
  tags: string[];
}

const TEMPLATES: ClinicalTemplate[] = [
  {
    id: "consultation",
    name: "Consulta Geral",
    description: "Consulta de rotina com exame clínico completo",
    category: "GENERAL",
    icon: "🩺",
    color: "#3B82F6",
    subjective:
      "Motivo da consulta: \nHistórico recente: \nAlimentação: \nComportamento: ",
    objective:
      "Estado geral: \nMucosas: \nTRC: \nLinfonodos: \nAuscultação cardíaca: \nAuscultação pulmonar: \nPalpação abdominal: \nPele e pelagem: ",
    assessment: "Diagnóstico presuntivo: \nDiagnósticos diferenciais: ",
    plan: "Tratamento: \nMedicação prescrita: \nRetorno: \nExames solicitados: ",
    defaultVitals: ["temperature", "heartRate", "respiratoryRate", "weight"],
    tags: ["consulta", "rotina"],
  },
  {
    id: "vaccination",
    name: "Vacinação",
    description: "Protocolo de vacinação com registo de lote",
    category: "PREVENTIVE",
    icon: "💉",
    color: "#10B981",
    subjective:
      "Protocolo vacinal: \nVacinações anteriores: \nReacções adversas conhecidas: ",
    objective:
      "Estado geral pré-vacinação: \nTemperatura: \nMucosas: \nHidratação: ",
    assessment: "Apto para vacinação: Sim / Não\nObservações: ",
    plan: "Vacina administrada: \nLaboratório: \nLote: \nValidade: \nVia de administração: \nPróxima dose: ",
    defaultVitals: ["temperature", "weight"],
    tags: ["vacinação", "preventivo"],
  },
  {
    id: "surgery-pre",
    name: "Pré-Operatório",
    description: "Avaliação pré-cirúrgica e planeamento",
    category: "SURGICAL",
    icon: "🔬",
    color: "#F59E0B",
    subjective:
      "Procedimento proposto: \nHistórico de anestesia: \nAlergias conhecidas: \nJejum desde: ",
    objective:
      "Exame pré-anestésico:\nClassificação ASA: \nHemograma: \nBioquímica: \nECG: \nRX tórax: ",
    assessment: "Risco cirúrgico: Baixo / Moderado / Alto\nContra-indicações: ",
    plan: "Protocolo anestésico: \nAntibiótico profilático: \nAnalgesia: \nCuidados especiais: ",
    defaultVitals: ["temperature", "heartRate", "respiratoryRate", "weight"],
    tags: ["cirurgia", "pré-operatório"],
  },
  {
    id: "surgery-post",
    name: "Pós-Operatório",
    description: "Acompanhamento e recuperação pós-cirúrgica",
    category: "SURGICAL",
    icon: "🩹",
    color: "#8B5CF6",
    subjective:
      "Procedimento realizado: \nDuração da cirurgia: \nIntercorrências: ",
    objective:
      "Recuperação anestésica: \nFerida cirúrgica: \nDrenagem: \nDor (escala 0-10): ",
    assessment: "Evolução: Favorável / Estável / Desfavorável\nComplicações: ",
    plan: "Antibiótico: \nAnalgésico: \nAnti-inflamatório: \nCuidados com ferida: \nRestrição de actividade: \nRemoção de pontos: ",
    defaultVitals: ["temperature", "heartRate", "respiratoryRate", "weight"],
    tags: ["cirurgia", "pós-operatório"],
  },
  {
    id: "emergency",
    name: "Emergência",
    description: "Atendimento de urgência com triagem",
    category: "EMERGENCY",
    icon: "🚨",
    color: "#EF4444",
    subjective:
      "Queixa principal: \nInício dos sinais: \nToxinas/trauma: \nÚltima refeição: ",
    objective:
      "Triagem (ABCDE):\nA - Via aérea: \nB - Respiração: \nC - Circulação: \nD - Neurológico: \nE - Exposição: ",
    assessment:
      "Gravidade: Crítico / Grave / Moderado / Leve\nDiagnóstico de trabalho: ",
    plan: "Acesso venoso: \nFluidoterapia: \nMedicação de emergência: \nMonitorização: \nExames urgentes: ",
    defaultVitals: [
      "temperature",
      "heartRate",
      "respiratoryRate",
      "weight",
      "bodyConditionScore",
    ],
    tags: ["emergência", "urgência"],
  },
  {
    id: "dermatology",
    name: "Dermatologia",
    description: "Avaliação dermatológica com mapeamento de lesões",
    category: "SPECIALTY",
    icon: "🔍",
    color: "#EC4899",
    subjective:
      "Queixa principal: \nDuração: \nPrurido (escala 0-10): \nTratamentos anteriores: \nControlo de ectoparasitas: ",
    objective:
      "Distribuição das lesões: \nTipo de lesão: \nRaspagem cutânea: \nLâmpada de Wood: \nCitologia: ",
    assessment: "Diagnóstico presuntivo: \nDiagnósticos diferenciais: ",
    plan: "Tratamento tópico: \nTratamento sistémico: \nDieta: \nControlo ambiental: \nRetorno: ",
    defaultVitals: ["temperature", "weight"],
    tags: ["dermatologia", "pele"],
  },
  {
    id: "dental",
    name: "Odontologia",
    description: "Avaliação e tratamento dentário",
    category: "SPECIALTY",
    icon: "🦷",
    color: "#06B6D4",
    subjective:
      "Queixa principal: \nHalitose: \nDificuldade de mastigação: \nHistórico de profilaxia: ",
    objective:
      "Exame oral:\nGrau de doença periodontal: I / II / III / IV\nCálculo: \nGengivite: \nMobilidade dentária: \nFracturas: \nMassa oral: ",
    assessment: "Diagnóstico: \nDentes a extrair: ",
    plan: "Profilaxia dentária: \nExtracções: \nAntibiótico: \nAnalgésico: \nDieta: \nCuidados em casa: ",
    defaultVitals: ["temperature", "weight"],
    tags: ["odontologia", "dentário"],
  },
];

@Injectable()
export class TemplatesService {
  getAll(): ClinicalTemplate[] {
    return TEMPLATES;
  }

  getById(id: string): ClinicalTemplate | undefined {
    return TEMPLATES.find((t) => t.id === id);
  }

  getByCategory(category: string): ClinicalTemplate[] {
    return TEMPLATES.filter((t) => t.category === category);
  }
}
