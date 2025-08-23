'use server';

import { GroupService } from '@/lib/services/groupService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * 求人に対してグループを作成する
 */
export async function createGroupForJob(jobId: number, groupName: string) {
  try {
    // グループ名の重複チェック
    const isNameAvailable = await GroupService.isGroupNameAvailable(
      groupName,
      jobId
    );
    if (!isNameAvailable) {
      throw new Error('このグループ名は既に使用されています');
    }

    const group = await GroupService.createGroup({
      name: groupName,
      jobId,
    });

    // 関連するページのキャッシュを再検証
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/groups');

    // 作成されたグループの詳細ページにリダイレクト
    redirect(`/groups/${group.id}`);
  } catch (error) {
    console.error('Group creation failed:', error);
    throw new Error('グループの作成に失敗しました');
  }
}

/**
 * 新規グループを作成して待機ルームに参加する
 */
export async function createAndJoinWaitingRoom(
  jobId: number,
  groupName: string
) {
  try {
    // グループ名の重複チェック
    const isNameAvailable = await GroupService.isGroupNameAvailable(
      groupName,
      jobId
    );
    if (!isNameAvailable) {
      throw new Error('このグループ名は既に使用されています');
    }

    const group = await GroupService.createGroup({
      name: groupName,
      jobId,
    });

    // 関連するページのキャッシュを再検証
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath('/groups');

    // 作成されたグループの詳細ページにリダイレクト
    redirect(`/groups/${group.id}`);
  } catch (error) {
    console.error('Waiting room creation failed:', error);
    throw new Error('待機ルームの作成に失敗しました');
  }
}

/**
 * グループにユーザーを追加する（QRコード招待用）
 */
export async function addUserToGroupByInvite(groupId: number, userId: number) {
  try {
    await GroupService.addUserToGroup(groupId, userId);

    // 関連するページのキャッシュを再検証
    revalidatePath(`/groups/${groupId}`);

    return { success: true };
  } catch (error) {
    console.error('Failed to add user to group:', error);
    return { success: false, error: 'ユーザーの追加に失敗しました' };
  }
}
