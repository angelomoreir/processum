import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Documento } from '../types'
import { api, fetchOrSeed } from '../lib/api'

interface DocumentosState {
  documentos: Documento[]
  fetchAll: () => Promise<void>
  addDocumento: (documento: Omit<Documento, 'id' | 'created_at'>) => void
  uploadDocumento: (
    ficheiro: File,
    refs?: { processo_id?: string; cliente_id?: string }
  ) => Promise<Documento | null>
  deleteDocumento: (id: string) => void
  getDocumentosByProcesso: (processoId: string) => Documento[]
  getDocumentosByCliente: (clienteId: string) => Documento[]
}

const MOCK_DOCUMENTOS: Documento[] = [
  {
    id: '1',
    nome: 'Petição Inicial.pdf',
    tipo: 'application/pdf',
    tamanho: 245760,
    url: '',
    processo_id: '1',
    uploaded_by: '1',
    versao: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome: 'Contrato de Mandato.pdf',
    tipo: 'application/pdf',
    tamanho: 102400,
    url: '',
    cliente_id: '1',
    uploaded_by: '1',
    versao: 1,
    created_at: new Date().toISOString(),
  },
]

export const useDocumentosStore = create<DocumentosState>()(
  persist(
    (set, get) => ({
      documentos: MOCK_DOCUMENTOS,

      fetchAll: async () => {
        const rows = await fetchOrSeed<Documento>('/documentos', 'documentos', get().documentos)
        set({ documentos: rows })
      },

      addDocumento: (documentoData) => {
        const newDocumento: Documento = {
          ...documentoData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
        }
        set((state) => ({
          documentos: [...state.documentos, newDocumento],
        }))
        api.post('/documentos', newDocumento).catch((e) => console.error(e))
      },

      uploadDocumento: async (ficheiro, refs = {}) => {
        const formData = new FormData()
        formData.append('ficheiro', ficheiro)
        if (refs.processo_id) formData.append('processo_id', refs.processo_id)
        if (refs.cliente_id) formData.append('cliente_id', refs.cliente_id)
        try {
          const doc = await api.upload('/documentos/upload', formData)
          set((state) => ({ documentos: [...state.documentos, doc] }))
          return doc as Documento
        } catch (e) {
          console.error(e)
          return null
        }
      },

      deleteDocumento: (id) => {
        set((state) => ({
          documentos: state.documentos.filter((d) => d.id !== id),
        }))
        api.del(`/documentos/${id}`).catch((e) => console.error(e))
      },

      getDocumentosByProcesso: (processoId) => {
        return get().documentos.filter((d) => d.processo_id === processoId)
      },

      getDocumentosByCliente: (clienteId) => {
        return get().documentos.filter((d) => d.cliente_id === clienteId)
      },
    }),
    {
      name: 'documentos-storage',
    }
  )
)
