import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth';

export type UserRole = 'admin' | 'supervisor' | 'operador' | 'laboratorio';
export type ModuleId =
  | 'insumos'
  | 'fornos'
  | 'producao'
  | 'blending'
  | 'laboratorio'
  | 'indicadores'
  | 'custodia'
  | 'qualidade'
  | 'config';

export interface ModulePermission {
  canView: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
}

// Matriz de permissões por módulo e perfil
const PERMISSIONS_MATRIX: Record<ModuleId, Record<UserRole, ModulePermission>> = {
  // INSUMOS - Cadastro de matérias-primas
  insumos: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: true, canEdit: false, canCreate: false, canDelete: false },
    laboratorio: { canView: true, canEdit: true, canCreate: true, canDelete: false },
  },

  // FORNOS - Gestão e monitoramento
  fornos: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: true, canEdit: false, canCreate: false, canDelete: false }, // Só opera (turnos/leituras)
    laboratorio: { canView: true, canEdit: false, canCreate: false, canDelete: false },
  },

  // PRODUÇÃO - Controle de produção
  producao: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: true, canEdit: true, canCreate: true, canDelete: false }, // Registra produção
    laboratorio: { canView: true, canEdit: false, canCreate: false, canDelete: false },
  },

  // BLENDING - Motor de mistura
  blending: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: true, canEdit: false, canCreate: false, canDelete: false }, // Só visualiza sugestões
    laboratorio: { canView: true, canEdit: true, canCreate: false, canDelete: false },
  },

  // LABORATÓRIO - Laudos
  laboratorio: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: false, canCreate: false, canDelete: false },
    operador: { canView: false, canEdit: false, canCreate: false, canDelete: false }, // Não acessa
    laboratorio: { canView: true, canEdit: true, canCreate: true, canDelete: true }, // Acesso total
  },

  // INDICADORES - KPIs
  indicadores: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: false, canCreate: false, canDelete: false },
    operador: { canView: false, canEdit: false, canCreate: false, canDelete: false }, // Não acessa
    laboratorio: { canView: true, canEdit: false, canCreate: false, canDelete: false },
  },

  // CADEIA DE CUSTÓDIA - Rastreabilidade
  custodia: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: true, canEdit: false, canCreate: false, canDelete: false }, // Só consulta
    laboratorio: { canView: true, canEdit: false, canCreate: false, canDelete: false },
  },

  // CONTROLE DE QUALIDADE - Inspeções
  qualidade: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: true, canEdit: true, canCreate: true, canDelete: false },
    operador: { canView: false, canEdit: false, canCreate: false, canDelete: false }, // Não acessa
    laboratorio: { canView: true, canEdit: true, canCreate: true, canDelete: false },
  },

  // CONFIGURAÇÕES - Sistema
  config: {
    admin: { canView: true, canEdit: true, canCreate: true, canDelete: true },
    supervisor: { canView: false, canEdit: false, canCreate: false, canDelete: false },
    operador: { canView: false, canEdit: false, canCreate: false, canDelete: false },
    laboratorio: { canView: false, canEdit: false, canCreate: false, canDelete: false },
  },
};

// Módulos visíveis por perfil (para o dashboard)
const VISIBLE_MODULES: Record<UserRole, ModuleId[]> = {
  admin: [
    'insumos',
    'fornos',
    'producao',
    'blending',
    'laboratorio',
    'indicadores',
    'custodia',
    'qualidade',
    'config',
  ],
  supervisor: ['insumos', 'fornos', 'producao', 'blending', 'indicadores', 'custodia', 'qualidade'],
  operador: [
    'fornos',
    'producao',
    'blending', // Só visualiza
    'custodia', // Só consulta
  ],
  laboratorio: [
    'insumos',
    'fornos',
    'blending',
    'laboratorio',
    'indicadores',
    'custodia',
    'qualidade',
  ],
};

@Injectable({
  providedIn: 'root',
})
export class PermissionsService {
  private authService = inject(AuthService);

  /**
   * Retorna o perfil do usuário atual
   */
  currentRole = computed<UserRole | null>(() => {
    const user = this.authService.user();
    return user ? (user.role as UserRole) : null;
  });

  /**
   * Verifica se o usuário pode ver um módulo
   */
  canViewModule(moduleId: ModuleId): boolean {
    const role = this.currentRole();
    if (!role) return false;
    return VISIBLE_MODULES[role]?.includes(moduleId) ?? false;
  }

  /**
   * Retorna as permissões do usuário para um módulo
   */
  getModulePermissions(moduleId: ModuleId): ModulePermission {
    const role = this.currentRole();
    if (!role) {
      return { canView: false, canEdit: false, canCreate: false, canDelete: false };
    }
    return (
      PERMISSIONS_MATRIX[moduleId]?.[role] ?? {
        canView: false,
        canEdit: false,
        canCreate: false,
        canDelete: false,
      }
    );
  }

  /**
   * Retorna lista de módulos visíveis para o usuário atual
   */
  getVisibleModules(): ModuleId[] {
    const role = this.currentRole();
    if (!role) return [];
    return VISIBLE_MODULES[role] ?? [];
  }

  /**
   * Verifica se é admin
   */
  isAdmin(): boolean {
    return this.currentRole() === 'admin';
  }

  /**
   * Verifica se é supervisor ou admin
   */
  isSupervisorOrAbove(): boolean {
    const role = this.currentRole();
    return role === 'admin' || role === 'supervisor';
  }

  /**
   * Verifica se é operador
   */
  isOperador(): boolean {
    return this.currentRole() === 'operador';
  }

  /**
   * Verifica se é do laboratório
   */
  isLaboratorio(): boolean {
    return this.currentRole() === 'laboratorio';
  }
}
