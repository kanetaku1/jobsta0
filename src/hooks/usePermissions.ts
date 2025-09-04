'use client';

import { useAuth } from '@/contexts/AuthContext';

export type Permission = 
  | 'view_jobs'           // 仕事情報の閲覧
  | 'join_groups'         // グループへの参加
  | 'create_groups'       // グループの作成
  | 'apply_jobs'          // 求人への応募
  | 'manage_jobs'         // 求人の管理（エンプロイヤー）
  | 'manage_applications' // 応募の管理（エンプロイヤー）
  | 'view_profile'        // プロフィールの閲覧
  | 'edit_profile';       // プロフィールの編集

export type UserRole = 'GUEST' | 'WORKER' | 'EMPLOYER';

interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean;
  userRole: UserRole;
  canViewJobs: boolean;
  canJoinGroups: boolean;
  canCreateGroups: boolean;
  canApplyJobs: boolean;
  canManageJobs: boolean;
  canManageApplications: boolean;
  canViewProfile: boolean;
  canEditProfile: boolean;
  isGuest: boolean;
  isWorker: boolean;
  isEmployer: boolean;
  isAuthenticated: boolean;
}

export default function usePermissions(): UsePermissionsReturn {
  const { user, prismaUser, userStatus } = useAuth();

  // ユーザーロールの決定
  const getUserRole = (): UserRole => {
    if (userStatus === 'GUEST') return 'GUEST';
    if (prismaUser?.userType === 'EMPLOYER') return 'EMPLOYER';
    if (prismaUser?.userType === 'WORKER') return 'WORKER';
    return 'GUEST';
  };

  const userRole = getUserRole();
  const isAuthenticated = userStatus === 'REGISTERED' && !!user && !!prismaUser;

  // 権限チェック関数
  const hasPermission = (permission: Permission): boolean => {
    switch (permission) {
      case 'view_jobs':
        return true; // 全ユーザーが閲覧可能
      
      case 'join_groups':
        return true; // 全ユーザーが参加可能
      
      case 'create_groups':
        return isAuthenticated && (userRole === 'WORKER' || userRole === 'EMPLOYER');
      
      case 'apply_jobs':
        return isAuthenticated && (userRole === 'WORKER' || userRole === 'EMPLOYER');
      
      case 'manage_jobs':
        return isAuthenticated && userRole === 'EMPLOYER';
      
      case 'manage_applications':
        return isAuthenticated && userRole === 'EMPLOYER';
      
      case 'view_profile':
        return isAuthenticated;
      
      case 'edit_profile':
        return isAuthenticated;
      
      default:
        return false;
    }
  };

  // 個別権限の取得
  const canViewJobs = hasPermission('view_jobs');
  const canJoinGroups = hasPermission('join_groups');
  const canCreateGroups = hasPermission('create_groups');
  const canApplyJobs = hasPermission('apply_jobs');
  const canManageJobs = hasPermission('manage_jobs');
  const canManageApplications = hasPermission('manage_applications');
  const canViewProfile = hasPermission('view_profile');
  const canEditProfile = hasPermission('edit_profile');

  // ロール判定
  const isGuest = userRole === 'GUEST';
  const isWorker = userRole === 'WORKER';
  const isEmployer = userRole === 'EMPLOYER';

  return {
    hasPermission,
    userRole,
    canViewJobs,
    canJoinGroups,
    canCreateGroups,
    canApplyJobs,
    canManageJobs,
    canManageApplications,
    canViewProfile,
    canEditProfile,
    isGuest,
    isWorker,
    isEmployer,
    isAuthenticated,
  };
}
