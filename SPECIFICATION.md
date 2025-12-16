# 不良分析モバイルアプリ仕様書

## 1. 概要

### 1.1 プロジェクト概要
- **アプリ名**: 不良分析モバイル
- **プラットフォーム**: iOS / Android（React Native + Expo）
- **目的**: 製造現場での不良報告・分析をモバイルで実現
- **対象ユーザー**: 作業員、管理者、経営者

### 1.2 技術スタック
| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React Native + Expo | SDK 52 |
| 言語 | TypeScript | 5.x |
| ナビゲーション | React Navigation | 6.x |
| UI ライブラリ | React Native Paper | 5.x |
| 状態管理 | React Context | - |
| HTTP クライアント | Axios | 1.x |
| セキュアストレージ | expo-secure-store | - |

---

## 2. デザインシステム

### 2.1 カラーパレット（Webアプリと統一）

| 用途 | カラー名 | HEXコード | 使用箇所 |
|------|---------|-----------|----------|
| Primary | Blue | `#1976d2` | ヘッダー、ボタン、AI機能 |
| Success | Green | `#2e7d32` | データ入力セクション |
| Info | Light Blue | `#0288d1` | データ分析セクション |
| Warning | Orange | `#ed6c02` | ナレッジセクション |
| Error | Red | `#d32f2f` | 管理者セクション、ログアウト |
| Grey | Grey | `#616161` | 設定 |

### 2.2 重大度カラー

| 重大度 | カラー | 使用例 |
|--------|--------|--------|
| Critical | `#d32f2f` (Red) | 重大な不良 |
| High | `#ed6c02` (Orange) | 高リスク |
| Medium | `#0288d1` (Blue) | 中程度 |
| Low | `#2e7d32` (Green) | 軽微 |

### 2.3 タイポグラフィ

| 要素 | サイズ | ウェイト |
|------|--------|----------|
| ヘッダー | 20sp | Bold |
| セクションタイトル | 16sp | Semi-Bold |
| 本文 | 14sp | Regular |
| キャプション | 12sp | Regular |

---

## 3. 画面構成

### 3.1 画面一覧

```
App
├── AuthStack (未認証)
│   └── LoginScreen          # ログイン画面
│
└── MainTabs (認証済み)
    ├── HomeTab
    │   ├── DashboardScreen  # ダッシュボード
    │   └── DefectDetailScreen # 不良詳細
    │
    ├── InputTab
    │   └── DefectInputScreen # 不適合報告入力
    │
    ├── ChatTab
    │   └── AIChatScreen     # AIアシスタント
    │
    └── ProfileTab
        ├── ProfileScreen    # プロフィール
        └── SettingsScreen   # 設定
```

### 3.2 ナビゲーション構造

- **Bottom Tab Navigator**: 4つのメインタブ
  1. ホーム（ダッシュボード）
  2. 報告（不適合報告入力）
  3. AI（AIアシスタント）
  4. プロフィール

---

## 4. 画面詳細仕様

### 4.1 ログイン画面 (LoginScreen)

#### 機能
- ユーザー名/パスワード認証
- 認証トークンのセキュア保存
- エラーメッセージ表示

#### UI要素
| 要素 | タイプ | 説明 |
|------|--------|------|
| ロゴ | Image | アプリロゴ + アプリ名「不良分析」 |
| ユーザー名入力 | TextInput | プレースホルダー「ユーザー名」 |
| パスワード入力 | TextInput | セキュア入力、表示切替ボタン |
| ログインボタン | Button | Primary色、ローディング表示 |
| エラー表示 | Snackbar | 認証失敗時にエラーメッセージ |

#### バリデーション
- ユーザー名: 必須
- パスワード: 必須

---

### 4.2 ダッシュボード画面 (DashboardScreen)

#### 機能
- KPI サマリー表示
- 最近の不良一覧
- プルダウン更新

#### UI要素

##### KPIカード（4つ）
| カード | 値 | アイコン | カラー |
|--------|-----|---------|--------|
| 総不良件数 | 数値 | AlertCircle | Primary |
| 重大な不良 | 数値 | AlertTriangle | Error |
| 今月の不良 | 数値 | Calendar | Info |
| 影響機械数 | 数値 | Settings | Warning |

##### 最近の不良リスト
| 項目 | 表示内容 |
|------|----------|
| タイトル | 報告ID + 機械名 |
| サブタイトル | 不良説明（最大2行） |
| 右側 | 重大度チップ + 日時 |

#### データ取得
- `GET /stats` - 統計情報
- `GET /api/defect-reports?limit=10` - 最近の不良

---

### 4.3 不適合報告入力画面 (DefectInputScreen)

#### 機能
- 新規不良報告の作成
- 機械選択（ドロップダウン）
- 画像添付（カメラ/ギャラリー）
- 音声入力対応

#### UI要素

| 要素 | タイプ | 必須 | 説明 |
|------|--------|------|------|
| 機械選択 | Dropdown | ○ | 機械一覧から選択 |
| 重大度選択 | SegmentedButton | ○ | Low/Medium/High/Critical |
| 不良説明 | TextInput (multiline) | ○ | 最低10文字 |
| 作業者名 | TextInput | - | 任意入力 |
| 顧客名 | TextInput | - | 任意入力 |
| 画像添付 | ImagePicker | - | 複数枚可能 |
| 送信ボタン | Button | - | Success色 |

#### 重大度セレクター
```
[  Low  ] [ Medium ] [  High  ] [Critical]
  緑色      青色       オレンジ     赤色
```

#### バリデーション
- 機械: 必須選択
- 重大度: 必須選択
- 不良説明: 10文字以上

#### データ送信
- `POST /api/defect-reports`

---

### 4.4 AIチャット画面 (AIChatScreen)

#### 機能
- 自然言語での質問
- ストリーミング応答表示
- 会話履歴保持
- サジェストクエリ表示

#### UI要素

##### ヘッダー
- タイトル: 「AI アシスタント」
- 新規チャットボタン

##### メッセージリスト
| メッセージタイプ | 配置 | 背景色 |
|------------------|------|--------|
| ユーザー | 右寄せ | Primary Light |
| アシスタント | 左寄せ | Surface |

##### サジェストクエリ（初期表示）
```
- CMX800の不良件数は？
- 位置度公差を超えた不良の根本原因は何ですか？
- ワークが折れる不良の主な原因を分析してください
- 加工中に製品が動いてしまう不良の原因と対策を教えてください
- 重大度criticalの不良に共通する根本原因の傾向を分析してください
```

##### 入力エリア
| 要素 | 説明 |
|------|------|
| テキスト入力 | マルチライン、送信ボタン付き |
| 送信ボタン | アイコンボタン（Send） |

#### データ送信
- `POST /query`
  - リクエスト: `{ query: string, conversation_history: [] }`
  - レスポンス: `{ response: string, sources: [] }`

---

### 4.5 プロフィール画面 (ProfileScreen)

#### 機能
- ユーザー情報表示
- ログアウト

#### UI要素

##### ユーザー情報
| 項目 | 表示 |
|------|------|
| アバター | イニシャル表示 |
| 名前 | フルネーム |
| ユーザー名 | @username |
| 役割 | チップ表示（色分け） |

##### 役割カラー
| 役割 | 日本語 | カラー |
|------|--------|--------|
| admin | 管理者 | Error |
| manager | 管理職 | Warning |
| operator | 作業員 | Info |
| viewer | 閲覧者 | Success |

##### メニュー項目
| 項目 | アイコン | アクション |
|------|---------|-----------|
| 設定 | Cog | 設定画面へ |
| ログアウト | Logout | ログアウト確認ダイアログ |

---

## 5. API 仕様

### 5.1 認証API

#### ログイン
```
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

Request:
  username: string
  password: string

Response:
  {
    "access_token": string,
    "token_type": "bearer",
    "expires_in": number
  }
```

#### ログアウト
```
POST /api/auth/logout
Authorization: Bearer {token}

Response:
  { "message": "Successfully logged out" }
```

#### 現在のユーザー取得
```
GET /api/auth/me
Authorization: Bearer {token}

Response:
  {
    "id": number,
    "username": string,
    "email": string,
    "full_name": string,
    "role": "admin" | "manager" | "operator" | "viewer",
    "is_active": boolean
  }
```

### 5.2 統計API

```
GET /stats
Authorization: Bearer {token}

Response:
  {
    "total_defects": number,
    "critical_defects": number,
    "defects_this_month": number,
    "trend_percentage": number,
    "machines_affected": number
  }
```

### 5.3 不良報告API

#### 一覧取得
```
GET /api/defect-reports?limit=10&sort=-created_at
Authorization: Bearer {token}

Response:
  {
    "results": [
      {
        "id": string,
        "report_id": string,
        "machine_name": string,
        "defect_description": string,
        "severity": string,
        "created_at": string
      }
    ]
  }
```

#### 新規作成
```
POST /api/defect-reports
Authorization: Bearer {token}
Content-Type: application/json

Request:
  {
    "machine_id": string,
    "defect_description": string,
    "severity": "low" | "medium" | "high" | "critical",
    "operator_name": string (optional),
    "customer_name": string (optional)
  }

Response:
  { DefectReport object }
```

### 5.4 AIクエリAPI

```
POST /query
Authorization: Bearer {token}
Content-Type: application/json

Request:
  {
    "query": string,
    "conversation_history": [
      { "role": "user" | "assistant", "content": string }
    ]
  }

Response:
  {
    "response": string,
    "sources": string[]
  }
```

---

## 6. 状態管理

### 6.1 AuthContext

```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

### 6.2 ローカルストレージ

| キー | 保存先 | 用途 |
|------|--------|------|
| access_token | SecureStore | アクセストークン |
| refresh_token | SecureStore | リフレッシュトークン |

---

## 7. エラーハンドリング

### 7.1 ネットワークエラー
- タイムアウト: 30秒
- リトライ: 自動リトライなし、ユーザー操作で再試行

### 7.2 認証エラー
- 401: トークンリフレッシュ試行 → 失敗時はログイン画面へ
- 403: 権限エラー表示

### 7.3 バリデーションエラー
- フォーム送信前にクライアントバリデーション
- サーバーエラーは詳細メッセージを表示

---

## 8. セキュリティ

### 8.1 トークン管理
- アクセストークン: expo-secure-store に保存
- リフレッシュトークン: expo-secure-store に保存
- トークン有効期限: アクセス15分、リフレッシュ7日

### 8.2 通信
- HTTPS必須（本番環境）
- 開発環境: HTTP許可（ローカルIPのみ）

---

## 9. ファイル構成

```
mobile/
├── App.tsx                      # エントリーポイント
├── app.json                     # Expo設定
├── package.json
├── tsconfig.json
│
└── src/
    ├── components/              # 共通コンポーネント
    │   ├── KPICard.tsx
    │   ├── DefectListItem.tsx
    │   ├── SeverityChip.tsx
    │   ├── ChatMessage.tsx
    │   └── LoadingScreen.tsx
    │
    ├── contexts/                # コンテキスト
    │   └── AuthContext.tsx
    │
    ├── hooks/                   # カスタムフック
    │   ├── useAuth.ts
    │   └── useApi.ts
    │
    ├── navigation/              # ナビゲーション
    │   ├── AppNavigator.tsx
    │   ├── AuthStack.tsx
    │   └── MainTabs.tsx
    │
    ├── screens/                 # 画面
    │   ├── LoginScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── DefectInputScreen.tsx
    │   ├── AIChatScreen.tsx
    │   ├── ProfileScreen.tsx
    │   └── SettingsScreen.tsx
    │
    ├── services/                # APIサービス
    │   └── api.ts
    │
    ├── theme/                   # テーマ設定
    │   └── index.ts
    │
    └── types/                   # 型定義
        └── index.ts
```

---

## 10. 開発・デプロイ

### 10.1 開発環境セットアップ

```bash
# 依存関係インストール
cd mobile
npm install

# 開発サーバー起動
npm start

# iOS シミュレーター
npm run ios

# Android エミュレーター
npm run android
```

### 10.2 API接続設定

開発時は `src/services/api.ts` の `API_BASE_URL` を変更:

```typescript
const API_BASE_URL = __DEV__
  ? 'http://192.168.x.x:8000'  // ローカルIPアドレス
  : 'https://production-api.example.com';
```

### 10.3 ビルド

```bash
# iOS ビルド
eas build --platform ios

# Android ビルド
eas build --platform android
```

---

## 11. 今後の拡張予定

- [ ] プッシュ通知（重大な不良発生時）
- [ ] オフラインモード対応
- [ ] バーコード/QRコードスキャン（機械識別）
- [ ] 音声入力による不良報告
- [ ] 写真からのOCR（不良票読み取り）
