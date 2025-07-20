/*Googleカレンダーに新しいイベントを作成する。 */

  import { google } from 'googleapis';
  import { OAuth2Client } from 'google-auth-library'; //「認証処理」を行うライブラリ

  //型定義
  interface ReservationEvent { 
    messageId: string; //メールのID
    summary: string;   //イベントタイトル
    location?: string; //部屋番号
    guest: string;     //ゲスト
    start: string;     //チェックイン
    end: string;       //チェックアウト　
  }

  //endにプラス1日して、チェックアウト日をわかりやすくする関数
  function addOneDay(dateStr: string): string { 
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  }

  //Google OAuth2 認証情報（auth）と、予約情報（reservation）を受け取る
  export async function createCalendarEvent(
    oauth2Client: OAuth2Client, 
    reservationInfo: ReservationEvent) {

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 既存イベントの検索
    const existingEvents = await calendar.events.list({
      calendarId: 'primary', //別のカレンダーにしたい場合は、ここに対象のカレンダーIDを入れる
      timeMin: reservationInfo.start + 'T00:00:00Z',
      timeMax: reservationInfo.end + 'T23:59:59Z',
      q: reservationInfo.messageId, // 説明欄に含まれているか検索
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime'
    });

    if (existingEvents.data.items?.length) {
      console.log(`⚠️ すでに登録済みの予約だよ（messageId: ${reservationInfo.messageId}）`);
      return; 
    }

    //出力ログ
    console.log('予約情報:', reservationInfo);
    console.log('予約開始日:', reservationInfo.start);
    console.log('予約終了日:', reservationInfo.end);

    try{
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
        summary: `${reservationInfo.summary}（${reservationInfo.guest}）`,
        location: reservationInfo.location,
        description: `予約メールID: ${reservationInfo.messageId}`,
        start: { date: reservationInfo.start },
        end: { date: addOneDay(reservationInfo.end) },
        },
      });

      console.log('✅ イベント追加レスポンス:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ createCalendarEventでエラー:', error);
      throw error;
    }
  }
