import { useEquipaStore } from '../stores/equipaStore'
import { useClientesStore } from '../stores/clientesStore'
import { useProcessosStore } from '../stores/processosStore'
import { usePrazosStore } from '../stores/prazosStore'
import { useTarefasStore } from '../stores/tarefasStore'
import { useHorasStore } from '../stores/horasStore'
import { useDocumentosStore } from '../stores/documentosStore'
import { useFinanceiroStore } from '../stores/financeiroStore'
import { useAgendamentoStore } from '../stores/agendamentoStore'
import { useComunicacoesStore } from '../stores/comunicacoesStore'
import { useConflitosStore } from '../stores/conflitosStore'
import { useDepartamentosStore } from '../stores/departamentosStore'
import { useOrcamentosStore } from '../stores/orcamentosStore'
import { useTrustAccountingStore } from '../stores/trustAccountingStore'
import { useWikiStore } from '../stores/wikiStore'
import { useChatStore } from '../stores/chatStore'
import { usePortalClienteStore } from '../stores/portalClienteStore'
import { useMarketingCRMStore } from '../stores/marketingCRMStore'
import { useLGPDStore } from '../stores/lgpdStore'
import { useAuditoriaStore } from '../stores/auditoriaStore'
import { useTimerStore } from '../stores/timerStore'
import { useConfiguracoesStore } from '../stores/configuracoesStore'
import { useAuthStore } from '../stores/authStore'
import { getToken } from './api'

let syncing: Promise<void> | null = null

/**
 * Carrega todos os dados do servidor para os stores locais.
 * Ordem: utilizadores → clientes → processos → restantes (que dependem
 * dos primeiros para enriquecer relações).
 */
export function syncAll(): Promise<void> {
  if (syncing) return syncing
  syncing = (async () => {
    if (!useAuthStore.getState().user && !getToken()) return

    // 1.º nível: referências base
    await useEquipaStore.getState().fetchAll()
    await useClientesStore.getState().fetchAll()
    await useProcessosStore.getState().fetchAll()

    // 2.º nível: o resto em paralelo
    await Promise.all([
      usePrazosStore.getState().fetchAll(),
      useTarefasStore.getState().fetchAll(),
      useHorasStore.getState().fetchAll(),
      useDocumentosStore.getState().fetchAll(),
      useFinanceiroStore.getState().fetchAll(),
      useAgendamentoStore.getState().fetchAll(),
      useComunicacoesStore.getState().fetchAll(),
      useConflitosStore.getState().fetchAll(),
      useDepartamentosStore.getState().fetchAll(),
      useOrcamentosStore.getState().fetchAll(),
      useTrustAccountingStore.getState().fetchAll(),
      useWikiStore.getState().fetchAll(),
      useChatStore.getState().fetchAll(),
      usePortalClienteStore.getState().fetchAll(),
      useMarketingCRMStore.getState().fetchAll(),
      useLGPDStore.getState().fetchAll(),
      useAuditoriaStore.getState().fetchAll(),
      useTimerStore.getState().fetchAll(),
      useConfiguracoesStore.getState().fetchAll(),
    ])
  })().finally(() => {
    syncing = null
  })
  return syncing
}
