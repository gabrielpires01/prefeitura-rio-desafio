export interface Saude {
    ultima_consulta: string | null;
    vacinas_em_dia: boolean;
    alertas: string[];
}

export interface Educacao {
    escola: string | null;
    frequencia_percent: number | null;
    alertas: string[];
}

export interface AssistenciaSocial {
    cad_unico: boolean;
    beneficio_ativo: boolean;
    alertas: string[];
}

export interface Child {
    id: string;
    nome: string;
    data_nascimento: string;
    bairro: string;
    responsavel: string;
    saude: Saude | null;
    educacao: Educacao | null;
    assistencia_social: AssistenciaSocial | null;
    revisado: boolean;
    revisado_por: string | null;
    revisado_em: string | null;
}

export interface ChildListResult {
    children: Child[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}

export interface Summary {
    total_criancas: number;
    com_alertas_saude: number;
    com_alertas_educacao: number;
    com_alertas_assistencia_social: number;
    revisadas: number;
    sem_dados: number;
}

export interface ChildListParams {
    bairro?: string;
    com_alertas?: boolean;
    revisado?: boolean;
    page?: number;
    page_size?: number;
}
