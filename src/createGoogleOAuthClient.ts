/*Google APIにアクセスするためにOAuth2を使って認証し、アクセストークンを取得・保存する */

  import { google } from "googleapis";  //Google APIにアクセスするため
  import * as fs from "fs";             //ファイルの読み書きを行う
  import * as readline from "readline"; //キーボードからの入力を受け取る
  import * as path from 'path';         //ファイルパスをOSに合わせて扱える

  //GoogleAPIのアクセス範囲
  const SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ];

  const TOKEN_PATH = path.join(__dirname, '../token.json');             //（初回はトークンない）
  const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json'); //認証情報を記述したJOSN

/* 認証済みクライアントを返すauthorize関数*/
  export async function authorizeWithGoogleOAuth() {  

    const jsonString = fs.readFileSync(CREDENTIALS_PATH, { encoding: 'utf8' });   //utf8で読み込こむ　
    const googleCredentials = JSON.parse(jsonString) ;                            //パースして、JSON文字列からオブジェクトへ変換
    const { client_id, client_secret, redirect_uris } = googleCredentials.installed; //キーの内容を分割代入
    console.log('✅ credentials 読み込み成功');

  //OAuth2認証クライアントを作成
    const oauth2Client = new google.auth.OAuth2(
      client_id, 
      client_secret, //正規であることを示す
      redirect_uris[0] //認証後に戻ってくるURL
    );
    console.log('✅ OAuth2Client 読み込み成功');

  /*トークンファイルがあるか確認、あればOAuth2Clientへ返す */
    if (fs.existsSync(TOKEN_PATH)){ 
      console.log('✅ トークンファイル発見、読み込み中...'); 
      //ファイルからトークン（JSON 形式の文字列）を読み取る
      const accessTokenData = fs.readFileSync(TOKEN_PATH, { encoding: 'utf8' });
      //アクセストークンを設定、すぐに Google API にアクセスできる状態にする
      oauth2Client.setCredentials(JSON.parse(accessTokenData)); //トークン文字列をJSON（オブジェクト）に変換
      console.log('🔓 トークンを使用して認証しました。');
      return oauth2Client; 
    }

//トークンなければ次の処理へ

/* 認可URLの表示と、ユーザーに入力してもらう*/
  //Googleのログイン・認可ページのURLを生成
    console.log('🔗 認可用URLを生成...');
    const authorizationUrl = oauth2Client.generateAuthUrl({ 
      access_type: "offline",   //リフレッシュトークンを取得
      scope: SCOPES.join(' '), //SCOPEで定義したURLをJOINで文字列へ。
    });
    console.log("URLにアクセスして認証してください:", authorizationUrl); //ターミナルにURLが出力

  //成功すると、Googleが認可コード（短い英数字列）を表示してくれる
  //おそらく「http://localhost」を設定しているので、localhost 接続が拒否されるかも
  //そんなときはhttps://qiita.com/n0bisuke/items/680ab634463eee2dbfd3 を参考

  //ターミナルに出力を表示する
    const readlineInterface  = readline.createInterface({ 
      input: process.stdin,   //ユーザーの入力を受け取る
      output: process.stdout  //プロンプトをターミナルに表示する
    });

  //ユーザーの入力が終わるまでawait（待機） 
  //入力が終わるとauthorizationCodeへ格納
    const authorizationCode = await new Promise<string>((resolve) =>
      readlineInterface.question('🔑 認可コードを入力してください: ', resolve) 
    );

    readlineInterface .close(); //readlineは入力を待ち続ける性質のため、必ず閉める

  /*トークン取得と保存 */
    //認可コードを使ってGoogleからアクセストークンとリフレッシュトークンを取得
    const { tokens } = await oauth2Client.getToken(authorizationCode);
    //トークンをJSON文字列に変換して、TOKEN_PATHに書き出す。（保存）
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens)); //再認証なしでAPIを使える
    //取得したtokensをOAuthのクライアントに設定する
    oauth2Client.setCredentials(tokens);
    console.log('✅ トークンを保存しました');
    return oauth2Client;

  }

