/*アプリ全体のエントリーポイント。一連の処理を実行。 */
import { authorizeWithGoogleOAuth } from './createGoogleOAuthClient';
import { fetchAirbnbReserve } from './extractReservationFromGmail';
import { createCalendarEvent } from './createCalendarEvent';

async function main() {
  try {
    // OAuth 認証する
    const oAuth2Client = await authorizeWithGoogleOAuth();
      console.log('✅ OAuth認証成功、メール検索開始🔍');
  

    // Airbnb予約メールの内容を取得
    const reservationGmail = await fetchAirbnbReserve(oAuth2Client);
    if (!reservationGmail) {
      console.log('📥新しいAirbnb予約メールはないよ😢');
      return;
    }

    // カレンダーに予定を登録
    await createCalendarEvent(oAuth2Client, reservationGmail);
    console.log('📅GoogleカレンダーにAirbnb予約を追加したよ😊');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

main();
