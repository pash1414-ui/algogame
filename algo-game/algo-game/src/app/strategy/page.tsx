import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '戦略ヒント - ALGO',
};

export default function StrategyPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg text-gray-700 space-y-5">
        <h1 className="text-2xl font-black text-gray-900">🧠 戦略ヒント</h1>

        <StratCard
          emoji="🔍"
          title="位置から絞り込む"
          body="相手のカードは左から右へ昇順に並んでいます。表向きになったカードを手がかりに、その間にある可能性のある数字だけを考えましょう。"
          example="例：左が「4クロ」、右が「7シロ」なら間のカードは 4クロより大きく 7シロより小さい数字です。"
        />

        <StratCard
          emoji="🎯"
          title="確実に当たる時だけ攻める"
          body="候補が1つしか残っていないときが確実な攻めどきです。リスクを減らすためにも、根拠のない当てずっぽうは避けましょう。"
        />

        <StratCard
          emoji="🛑"
          title="ストップを上手に使う"
          body="正解した後は「ストップ」を選ぶことで、引いたカードを裏向きのまま自分の手に加えられます。続けてアタックしてはずれると、引いたカードが表向きになるだけでなく、自分の手のカードも1枚めくれます。"
        />

        <StratCard
          emoji="📊"
          title="表向きカードで全体を把握する"
          body="お互いの表向きカードは全部分かります。全24枚のどれがすでに場に出ているかを頭に入れておくと、相手の伏せカードの候補を絞りやすくなります。"
        />

        <StratCard
          emoji="🎰"
          title="端のカードは当てやすい"
          body="相手の列の一番左（最小）や一番右（最大）のカードは、制約が少ない分候補数が多い場合があります。逆に、表向きカードに囲まれた伏せカードは候補が絞られやすくチャンスです。"
        />

        <StratCard
          emoji="😅"
          title="あえてストップしない手も"
          body="山札が残り少ない終盤は、引いたカードの情報がバレてもターンを続けた方が得になることもあります。状況に応じて判断しましょう。"
        />
      </div>
    </div>
  );
}

function StratCard({
  emoji,
  title,
  body,
  example,
}: {
  emoji: string;
  title: string;
  body: string;
  example?: string;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <h2 className="font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-600">{body}</p>
      {example && (
        <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 mt-2">{example}</p>
      )}
    </div>
  );
}
