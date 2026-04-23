import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age--;
  return age;
}

const alertLabels: Record<string, string> = {
  vacinas_atrasadas: "Vacinas atrasadas",
  consulta_atrasada: "Consulta atrasada",
  frequencia_baixa: "Frequência baixa",
  beneficio_suspenso: "Benefício suspenso",
  cadastro_ausente: "Cadastro ausente",
  cadastro_desatualizado: "Cadastro desatualizado",
  matricula_pendente: "Matrícula pendente",
};

export function labelAlert(alert: string): string {
  return alertLabels[alert] ?? alert;
}
