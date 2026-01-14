import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskApp from '../components/TaskApp'; // 想定されるメインコンポーネント

describe('タスク管理機能の統合テスト', () => {
  beforeEach(() => {
    // ローカルストレージをクリア
    localStorage.clear();
    vi.clearAllMocks();
  });

  /**
   * 基本機能テスト
   */
  it('新しいタスクを追加でき、リストに表示されること', async () => {
    render(<TaskApp />);
    const input = screen.getByPlaceholderText(/新しいタスクを入力/i);
    const addButton = screen.getByRole('button', { name: /追加/i });

    await userEvent.type(input, 'テストタスク');
    await userEvent.click(addButton);

    expect(screen.getByText('テストタスク')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('タスクを削除した際、リストから除外されること', async () => {
    render(<TaskApp />);
    const input = screen.getByPlaceholderText(/新しいタスクを入力/i);
    await userEvent.type(input, '削除対象タスク');
    await userEvent.click(screen.getByRole('button', { name: /追加/i }));

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    await userEvent.click(deleteButton);

    expect(screen.queryByText('削除対象タスク')).not.toBeInTheDocument();
  });

  it('保存機能：ブラウザをリフレッシュしてもデータが永続化されていること', async () => {
    const { unmount } = render(<TaskApp />);
    const input = screen.getByPlaceholderText(/新しいタスクを入力/i);
    
    await userEvent.type(input, '永続化テスト');
    await userEvent.click(screen.getByRole('button', { name: /追加/i }));

    // コンポーネントをアンマウントして再レンダリング（リロードのシミュレーション）
    unmount();
    render(<TaskApp />);

    expect(screen.getByText('永続化テスト')).toBeInTheDocument();
  });

  /**
   * エッジケース & バリデーション
   */
  it('空のタスク名を入力した際、エラーメッセージを表示し追加されないこと', async () => {
    render(<TaskApp />);
    const addButton = screen.getByRole('button', { name: /追加/i });
    
    await userEvent.click(addButton);

    expect(screen.getByText(/タスク名を入力してください/i)).toBeInTheDocument();
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });

  /**
   * シマンティック・マークアップ & アクセシビリティ
   */
  it('アクセシビリティ：主要な要素が適切なHTMLタグとロールを持っていること', () => {
    render(<TaskApp />);
    
    // mainランドマークの確認
    expect(screen.getByRole('main')).toBeInTheDocument();
    // フォーム要素のセマンティクス
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    // リスト構造の確認
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});