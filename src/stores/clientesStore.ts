import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Cliente } from '../types'
import { api, fetchOrSeed } from '../lib/api'

interface ClientesState {
  clientes: Cliente[]
  fetchAll: () => Promise<void>
  addCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => void
  updateCliente: (id: string, cliente: Partial<Cliente>) => void
  deleteCliente: (id: string) => void
}

const MOCK_CLIENTES: Cliente[] = [
  {
    id: '1',
    nome: 'Empresa ABC, Lda.',
    email: 'geral@empresaabc.pt',
    telefone: '+351 210 123 456',
    nif: '501234567',
    morada: 'Av. da Liberdade, 100, Lisboa',
    estagio: 'ativo',
    area_direito: 'Empresarial',
    notas: 'Cliente desde 2020',
    created_at: '2020-01-15',
    updated_at: '2024-01-10',
  },
  {
    id: '2',
    nome: 'João Ferreira',
    email: 'joao.ferreira@email.pt',
    telefone: '+351 912 345 678',
    nif: '123456789',
    morada: 'Rua dos Combatentes, 45, Porto',
    estagio: 'ativo',
    area_direito: 'Civil',
    notas: 'Processo de indemnização',
    created_at: '2023-06-20',
    updated_at: '2024-02-05',
  },
  {
    id: '3',
    nome: 'Maria Santos',
    email: 'maria.santos@email.pt',
    telefone: '+351 923 456 789',
    nif: '987654321',
    morada: 'Rua Augusta, 12, Lisboa',
    estagio: 'reuniao',
    area_direito: 'Família',
    notas: 'Interessada em processo de divórcio',
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
  },
  {
    id: '4',
    nome: 'Construções Silva, S.A.',
    email: 'contacto@csilva.pt',
    telefone: '+351 220 987 654',
    nif: '509876543',
    morada: 'Zona Industrial, Lote 5, Braga',
    estagio: 'contatado',
    area_direito: 'Trabalho',
    notas: 'Necessita apoio em processos trabalhistas',
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
  },
  {
    id: '5',
    nome: 'Ana Costa',
    email: 'ana.costa@email.pt',
    telefone: '+351 934 567 890',
    nif: '456789123',
    estagio: 'lead',
    notas: 'Contacto via website',
    created_at: '2024-03-10',
    updated_at: '2024-03-10',
  },
]

export const useClientesStore = create<ClientesState>()(
  persist(
    (set, get) => ({
      clientes: MOCK_CLIENTES,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Cliente>('/clientes', 'clientes', get().clientes)
        set({ clientes: rows })
      },

      addCliente: (clienteData) => {
        const now = new Date().toISOString()
        const newCliente: Cliente = {
          ...clienteData,
          id: crypto.randomUUID(),
          created_at: now,
          updated_at: now,
        }
        set((state) => ({
          clientes: [...state.clientes, newCliente],
        }))
        api.post('/clientes', newCliente).catch((e) => console.error(e))
      },

      updateCliente: (id, clienteData) => {
        const updated_at = new Date().toISOString()
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...clienteData, updated_at } : c
          ),
        }))
        api.put(`/clientes/${id}`, { ...clienteData, updated_at }).catch((e) => console.error(e))
      },

      deleteCliente: (id) => {
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }))
        api.del(`/clientes/${id}`).catch((e) => console.error(e))
      },
    }),
    {
      name: 'clientes-storage',
    }
  )
)
