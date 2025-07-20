/*Gmail API を使用して Airbnb からの予約確認メールを取得し、その本文を抽出 */

  import { google } from 'googleapis'; //各種 Google API にアクセスする
  import { OAuth2Client } from 'google-auth-library'; //認証情報を扱うためのクラス

/*メイン関数*/
  export async function fetchAirbnbReserve(oauth2Client: OAuth2Client) {  //引数oauth2Client：型GoogleOAuth2認証オブジェクトを受け取ってから
    const gmailClient  = google.gmail({ //Gmail API のクライアントインスタンス
      version: 'v1', 
      auth: oauth2Client 
    });
    
    //最新予約メールを検索
    const messagesList = await gmailClient.users.messages.list({
      userId: 'me', //認証されたユーザーのメールボックス
      q: 'from:@gmail.com subject:(予約確定)', //Gmailの検索クエリ
      maxResults: 1 //TODO 1日何通も来た場合、ここかえる？最新の1通のみを取得
    });

    
    const latestMessage = messagesList.data.messages?.[0]; //メール一覧（配列)の[0]一番新しいメールをみる
    if (!latestMessage) return null; 

    //メールの本文を取得
    const messageBody = await gmailClient.users.messages.get({ 
      userId: 'me',
      id: latestMessage.id!, 
      format: 'FULL' //ヘッダー・本文含めて取得
    });
  
    //text/plain の本文があるか探す
    //Base64でエンコードされた本文を取り出す
    //メール本文をBase64形式から文字列（UTF-8）にデコード
    const encodedBody = messageBody.data.payload?.parts?.find(p => p.mimeType === 'text/plain')?.body?.data;
    if (!encodedBody) return null;

    const decodedBodyText = Buffer.from(encodedBody.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'); //Base64をデコードして日本語文字列に戻す。

    // 宿泊情報抽出
    const checkinMatch = decodedBodyText.match(/チェックイン\s*\n?\s*(\d{1,2}月\d{1,2}日(?:（?.{1,3}）?))/);
    const checkoutMatch = decodedBodyText.match(/チェックアウト\s*\n?\s*(\d{1,2}月\d{1,2}日(?:（?.{1,3}）?))/);
    const guestMatch = decodedBodyText.match(/ゲスト人数\s*\n\s*(.+)/);

    let location: string;
      if(decodedBodyText.includes("ホームシアター")){
        location = "403号室"
      } else{
        location = "402号室"
      }


    if (!checkinMatch || !checkoutMatch || !guestMatch) return null;

    return {
      messageId: latestMessage.id!,
      summary: `Airbnb: ${location}`,
      guest: guestMatch[1].trim(),
      start: parseJapaneseDate(checkinMatch[1]),
      end: parseJapaneseDate(checkoutMatch[1]),
    };
  }

/*補助関数　日付解析
 「○月○日」形式の日本語日付を ISO 日付（YYYY-MM-DD）に変換
 年が省略されているので現在日付を基準に推定
*/
  function parseJapaneseDate(jpDate: string): string { 
                                  //jpDate 「6月1日」などの日本語日付文字列。
                                 //返り値は string 型で、ISO形式の日付（例：2025-06-01）を返す
    const match = jpDate.match(/(\d{1,2})月(\d{1,2})日/); 
                              //\d{1,2} は 1〜2桁の数字（例：6 や 12）
    if (!match) throw new Error("日付形式エラー: " + jpDate); //日付が正しく抽出できなかったら、エラー＋処理中断

    const [_, monthStr, dayStr] = match;
    const now = new Date();         //現在の日付を取得
    const currentYear = now.getFullYear(); //今の西暦がyearへ格納
    const month = Number(monthStr);        //文字列を数値へ型変換
    const day = Number(dayStr);

    // JSTの正午（12:00）を設定することでUTCとのズレを防ぐ
    const assumedDate = new Date(Date.UTC(currentYear, month - 1, day, 12, 0, 0)); //月が0から始まるので month - 1 へ

    // 年またぎに対応：今より前の日付は翌年と判断
    if (assumedDate.getTime() < now.getTime()) {
    assumedDate.setUTCFullYear(currentYear + 1); //抽出した日付が現在よりも過去なら、来年とみなす
    }
    return assumedDate.toISOString().split('T')[0];
  }
