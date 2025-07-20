# Reservation Gmail to Googlecalendar<br>
<h3>Airbnb予約自動カレンダー登録プログラム</h3>


## 概要
予約確定メールから予約情報を抽出し、Googleカレンダーに登録する<br>
TypeScript + Google API を使用。

---

## 使用技術

- TypeScript（Node.js）
- Gmail API
- Google Calendar API
- googleapis ライブラリ
- OS : Windows11　WSL


---
## 構成
```
reservation-Gmail-to-calendar/
├── credentials.json         ← OAuthクレデンシャル
├── token.json               ← 認証トークン（初回生成）
├── run_arms.bat             ←自動化機能のバッチファイル
├── node_modules/
└── src/
    ├── main.ts              ← メインスクリプト
    ├── createGoogleOAuthClient.ts       ← OAuth認証処理
    ├── extractReservationFromGmail.ts   ← GmailからAirbnb予約メールを抽出
    └── createCalendarEvent.ts           ← Googleカレンダーへの入力
    
---

## 処理の流れ

1. Google APIで認証（OAuth）
2. Gmailから「予約確定」メールを検索・取得
3. 取得したメール本文から必要な情報を抽出
4. Googleカレンダーに予約情報をイベントとして登録
```
---

## 入出力

- 入力：Airbnb予約メール（例：「予約確定」）
- 出力：Googleカレンダーイベント（例：Airbnb:402号室）

---

## 実行方法

### 事前準備
- GoogleAPIを有効にしておくこと（カレンダーとGmail）<br>
- credentials.jsonを作業フォルダ内にダウンロードしておくこと
[APIとOAuthの設定参考]
- https://zenn.dev/zozooizozzoizio/articles/602564083b542a
- https://blog.serverworks.co.jp/2021/01/08/130956<br>
- https://qiita.com/___yusuke49/items/7cd47adda20cbc6a16d3

### セットアップ <be>
・Node.js プロジェクト初期化<br>
・package.json が作成され、依存パッケージを管理<br>
・typeScriptを使えるようにしておく

    npm init -y
    npm install

### 必要に応じて、コード書き換え
- googleOAuth.ts : JOSNパス
- confirmed_gmail.ts : const resの q　探したいメールアドレスを書く
- calendar.ts : const existingEvents の　calendarId を、登録したいカレンダーIDに設定する
- ren_arms.bat 自動化機能をするなら、ディレクトリに合わせて書き換え必要


### ライブラリ

    npm install googleapis dotenv dayjs
    npm install -D typescript ts-node @types/node

### 初回認証（トークン作成）
    npx ts-node reservation-Gmail-to-calendar/src/main.ts

### 実行
    npx ts-node reservation-Gmail-to-calendar/src/main.ts

### 自動化
1. main.tsをビルドしてjsファイルをつくる
    npx tsc  
2. タスクスケジューラで設定する（他にも方法あります）
3. 実行する
---
## 今後の改善予定

- カレンダーの自動化入力ができているかどうか確認必要（WSLのリモートが切れるから、今回はタスクスケジューラで実施）
- 部屋ごとの色わけ
- 予約のキャンセルや変更についての自動化必要性
- extractReservationFromGmail.ts : const resのmaxrisult 最新の1件だと、同じ日にメールが何通か来たら入力されない可能性



---
## テスト
npx tsc --version
Version 5.8.3


| No | テスト項目   | 内容    | 期待される結果   |　pass/fild　|  備考 |
| -- | ------- | ---------- | -------------- | ------- | ------- |
|   | OAuth認証   |   認証URLへリンク　|  認証画面へ遷移ができる  | | |
|   | OAuth認証   |    authorize()　|  ✅ credentials 読み込み成功  | | |
|   | OAuth認証   |    authorize()　|  ✅ OAuth2Client 読み込み成功  | | |
|   | OAuth認証   |    トークンファイルがある　|  🔓 トークンを使用して認証しました。  | | |
|   | OAuth認証   |    トークンファイルがなかったら、認可URLを出力　|  🔗 認証URLを生成：  | | |
|   | OAuth認証   |    認可コード入力後　|  🔗 認証URLを生成：  | | |
|   | メール抽出   | 402の予約確定メールが存在する | 予約情報が正しく抽出される  |  | |
|   | メール抽出   | 403の予約確定メールが存在する | 予約情報が正しく抽出される  | | |
|   | メールなし   | メールが見つからない | エラーにならずスキップされる | | |
|   | カレンダー登録 | 最新の予約情報がある | イベントが登録される     |　| |
|   | カレンダー登録 | 既存の同予約がある | イベントは登録されない（stackしない） | |  |　
　
