import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(data: string | Date): string {
  return new Date(data).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatarDataHora(data: string | Date): string {
  return new Date(data).toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(valor)
}

export function formatarDuracao(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  if (horas === 0) return `${mins}min`
  if (mins === 0) return `${horas}h`
  return `${horas}h ${mins}min`
}

export function adicionarDiasUteis(data: Date, dias: number): Date {
  const result = new Date(data)
  let diasAdicionados = 0

  while (diasAdicionados < dias) {
    result.setDate(result.getDate() + 1)
    const diaSemana = result.getDay()
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasAdicionados++
    }
  }

  return result
}

export function calcularCorPrioridade(prioridade: string): string {
  switch (prioridade) {
    case 'urgente':
      return 'bg-red-500 text-white'
    case 'alta':
      return 'bg-orange-500 text-white'
    case 'media':
      return 'bg-yellow-500 text-black'
    case 'baixa':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}
