/*
まとめ https://typescriptbook.jp/
1:文法メモ
2:getとset 
3:非同期処理について
*/

/*
6/8 To　do
・読んで学ぶ方すすめる
・Node.js　おさらい
　プロミスについて、APIの取得とか、宣言など流れ


*/

/*  文法メモ  */
class Person {
  public name: string;  //フィールド変数：クラス内で定義された変数。各インスタンスが独自に値をもつ
  private age: number;  

  constructor(name: string, age: number) {  //コンストラクタンスタンスを作るときに実行される特別な関数。外から渡された値（引数）をフィールドに代入して初期化する
    this.name = name;  //ここでの this.name はクラスのフィールド、name は引数 
    this.age = age;
  }

  introduce(): void {  // introduce()：クラス内で定義する関数＝メソッド　Void返り値ないとき
    console.log(`My name is ${this.name} and I am ${this.age} years old.`);
  }
}

const john = new Person("John", 20);
console.log(john.name); // 'John'が出力される
//console.log(john.age);  // エラー（privateなのでアクセスできない）


/*  ゲッター・セッター  */

class Circle {
  private _radius: number;

  //コンストラクター クラスからオブジェクト（インスタンス）を作るときに最初に実行される関数。
  constructor(radius: number) { //初期化処理（変数に値を入れるなど）に使。
    this._radius = radius; //this._radius はそのオブジェクト自身のフィールド
  }

  // ゲッター privateなフィールド（_radius）を外から見られるようにする
  get radius(): number { //間に関数が入るので、条件を追加したり、計算したりもできる
    return this._radius;
  }

  // セッター 外からフィールドの値を書き換えられるようにする 
  set radius(radius: number) {
    if (radius <= 0) {
      throw new Error("Invalid radius value");
    }
    this._radius = radius;
  }
}

const circle = new Circle(5);// 👈 ここで constructor(radius: number)が呼ばれ、_rudiusに５が代入
console.log(circle.radius); // ゲッターが呼ばれて 5 が返る
circle.radius = 3;          // セッターのset rudius()が呼ばれる
console.log(circle.radius); // ゲッターが呼ばれて 3 が返る
circle.radius = -2;         // ❌ 例外: Invalid radius value


/*  Promiseについて  */
/*
 ・JavaScriptにおける非同期処理の結果を表すオブジェクト。
 ・非同期処理とは、時間のかかる操作（例：データ取得）を実行中も他の処理を続行できる仕組み.  
 ・アプリケーションの応答性が向上し、ユーザー体験が改善される。
 ・Promiseを使用することで、非同期処理の成功時や失敗時の処理を簡潔に記述できる。
  pending（保留中）: 初期状態で、処理が完了していない状態。
  fulfilled（成功）: 処理が成功し、結果が得られた状態。
  rejected（失敗）: 処理が失敗し、エラーが発生した状態

*/

//new Promise((resolve, reject) => { ... })   引数として渡される関数は「executor（実行者）」と呼ばれ、非同期処理を記述します。
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Promise resolved");  //setTimeoutは、指定した時間（ここでは2000ミリ秒＝2秒）後に関数を実行する。
  }, 2000);
});

//thenメソッドは、Promiseがfulfilledになったときに実行される関数を登録する。
// ここでは、resolveで渡された値（"Promise resolved"）がdataに渡され、コンソールに出力されます。
promise.then((data) => {
  console.log(data);
});


/* async/await 構文 */ 
/*
・非同期処理をより直感的かつ簡潔に記述するための構文。
・従来のPromiseチェーンやコールバック関数に比べて、コードの可読性と保守性が向上。
　async: 関数の前に付けることで、その関数は非同期関数となり、常にPromiseを返す
　await: async関数内で使用し、Promiseの解決を待ってから次の処理を実行する

*/ 
//new Promise((resolve) => setTimeout(resolve, ms)): setTimeoutを使用して、指定した時間後にresolveを呼び出すPromiseを返します

function delay(ms: number) { // 関数の引数で、遅延させたい時間（ミリ秒単位）を指定。
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//asyncキーワードを使用することで、関数内でawaitを使用できるようにする。
async function asyncFunction() {
  console.log("Start");
  await delay(2000); //delay関数を呼び出し、2秒間待機。awaitを使用することで、Promiseの解決を待ってから次の処理に進む。
  console.log("End")
}

asyncFunction();

