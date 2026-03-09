import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ルール説明 - ALGO',
};

export default function RulesPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg text-gray-700 space-y-5">
        <h1 className="text-2xl font-black text-gray-900">📖 アルゴ ルール説明</h1>

        <Section title="🃏 カードについて">
          <p>黒カード（0〜11）と白カード（0〜11）の合計24枚を使います。</p>
          <p>同じ数字の場合は、黒が白より前（左）に並べます。</p>
          <div className="flex gap-2 mt-2">
            <div className="w-12 h-16 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-xl border-2 border-gray-600">7</div>
            <div className="w-12 h-16 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center font-bold text-xl border-2 border-gray-300">7</div>
            <div className="flex items-center ml-2 text-sm text-gray-500">← 黒7は白7より左（小さい）</div>
          </div>
        </Section>

        <Section title="🎮 ゲームの準備">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>24枚をシャッフルして各プレイヤーに4枚ずつ配ります</li>
            <li>残り16枚が山札になります</li>
            <li>自分のカードは自分だけ確認して、数字の昇順に並べます</li>
            <li>カードは相手に向けて伏せます（数字は見せない）</li>
          </ul>
        </Section>

        <Section title="🔄 ターンの流れ">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>山札から1枚引く</strong>（自分だけ見える）</li>
            <li><strong>相手のふせたカードを1枚選ぶ</strong></li>
            <li><strong>数字を宣言する</strong>（「5！」など）</li>
            <li className="text-green-700">
              <strong>正解</strong>なら→ そのカードが表向きに。
              <ul className="list-disc list-inside ml-4 mt-1 text-green-600">
                <li><strong>続けてアタック</strong>できます</li>
                <li><strong>ストップ</strong>宣言もできます（引いたカードを裏向きで追加）</li>
              </ul>
            </li>
            <li className="text-red-700">
              <strong>はずれ</strong>なら→ 引いたカードが自分の列に表向きで追加。ターン終了
            </li>
          </ol>
        </Section>

        <Section title="🏆 勝利条件">
          <p className="font-bold text-gray-800">相手のカードをすべて表向きにしたら勝ちです！</p>
        </Section>

        <Section title="💡 ストップ作戦">
          <p>正解した後にストップを選ぶと、引いたカードを<strong>裏向きのまま</strong>自分の列に追加できます。</p>
          <p className="text-sm text-gray-500 mt-1">
            ※ アタックを続けてはずれると、引いたカードが<strong>表向きで</strong>追加されてしまいます。ストップは有力な戦略です！
          </p>
        </Section>

        <Section title="⚠️ 注意点">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>色（クロ/シロ）は伏せていても相手から見えています</li>
            <li>はずれたとき、自分の最初の裏向きカードが表向きになります</li>
            <li>山札が空になったら、引かずにアタックします</li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-bold text-gray-800 text-base mb-2">{title}</h2>
      <div className="text-sm text-gray-600 space-y-1">{children}</div>
    </div>
  );
}
