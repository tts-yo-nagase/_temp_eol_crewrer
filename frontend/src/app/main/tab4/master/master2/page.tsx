'use client'

import { Card, Title, Text } from '@tremor/react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const evaluationInProgress = [
  {
    status: '目標設定中',
    editable: true,
    plan: '2024年度人事評価',
    department: 'クラウドインテグレーショングループ',
    period: '23/4/1 - 24/3/31',
    grade: 'G1',
  },
  {
    status: '評価申請中',
    editable: false,
    plan: '2023年度人事評価',
    department: 'クラウドインテグレーショングループ',
    period: '24/4/1 - 25/3/31',
    grade: 'M2',
  },
  {
    status: 'フィードバック',
    editable: false,
    plan: '2023年度人事評価（※開発確認用フィードバック用）',
    department: 'クラウドインテグレーショングループ',
    period: '24/4/1 - 25/3/31',
    grade: 'M2',
  },
  {
    status: '一次評価',
    editable: false,
    plan: '2023年度人事評価（※開発確認用一次評価中の画面）',
    department: 'クラウドインテグレーショングループ',
    period: '24/4/1 - 25/3/31',
    grade: 'M2',
  },
  {
    status: '二次評価',
    editable: false,
    plan: '2023年度人事評価（※開発確認用二次評価中の画面）',
    department: 'クラウドインテグレーショングループ',
    period: '24/4/1 - 25/3/31',
    grade: 'M2',
  },
  {
    status: '最終評価',
    editable: false,
    plan: '2023年度人事評価（※開発確認用最終評価中の画面）',
    department: 'クラウドインテグレーショングループ',
    period: '24/4/1 - 25/3/31',
    grade: 'M2',
  }
]

// データの型定義
type Grade = 'G2' | 'G1' | 'S2' | 'M2';
type ChartDataItem = {
  year: number;
  G2: number | null;
  G1: number | null;
  S2: number | null;
  M2: number | null;
};

const chartData: ChartDataItem[] = [
  {
    year: 2012,
    G2: 2,
    G1: null,
    S2: null,
    M2: null
  },
  {
    year: 2013,
    G2: 45,
    G1: null,
    S2: null,
    M2: null
  },
  {
    year: 2014,
    G2: 48,
    G1: null,
    S2: null,
    M2: null
  },
  {
    year: 2015,
    G2: null,
    G1: 52,
    S2: null,
    M2: null
  },
  {
    year: 2016,
    G2: null,
    G1: 95,
    S2: null,
    M2: null
  },
  {
    year: 2017,
    G2: null,
    G1: 55,
    S2: null,
    M2: null
  },
  {
    year: 2018,
    G2: null,
    G1: null,
    S2: 58,
    M2: null
  },
  {
    year: 2019,
    G2: null,
    G1: null,
    S2: 60,
    M2: null
  },
  {
    year: 2020,
    G2: null,
    G1: null,
    S2: 60,
    M2: null
  },
  {
    year: 2021,
    G2: null,
    G1: null,
    S2: null,
    M2: 67
  },
  {
    year: 2022,
    G2: null,
    G1: null,
    S2: null,
    M2: 55
  }
]

const evaluationResults = chartData.map(item => {
  // その年の有効な等級と評価点を見つける
  const grades: Grade[] = ['G2', 'G1', 'S2', 'M2'];
  const activeGrade = grades.find(grade => item[grade] !== null) as Grade | undefined;
  const score = activeGrade ? item[activeGrade] : null;

  return {
    year: item.year,
    plan: `${item.year}年度人事評価`,
    score: score?.toFixed(2),
    grade: activeGrade,
    department: 'クラウドインテグレーショングループ',
    firstEvaluator: '豊通 次郎',
    secondEvaluator: '豊通 三郎',
    finalEvaluator: '豊通 四郎',
  }
}).filter(item => item.score !== null)

// 推奨ボーダーライン値
const borderValue = 60

// 等級ごとの色設定
const rankColors: Record<Grade, string> = {
  G2: '#86efac', // green-300
  G1: '#38bdf8', // sky-400
  S2: '#fb923c', // orange-400
  M2: '#fbbf24', // amber-400
}

export default function Master2Page() {
  return (
    <div className="container mx-auto p-4">
      <Title className="mb-6 text-2xl font-bold">評価管理</Title>

      {/* 実施中の評価一覧 */}
      <Card className="mb-4">
        <Text className="font-bold text-base mb-3">実施中</Text>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tremor-border dark:border-dark-tremor-border">
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  ステータス
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  評価計画
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  所属
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  期間
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  等級
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluationInProgress.map((item, index) => (
                <tr key={index} className="border-b border-tremor-border dark:border-dark-tremor-border">
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.status === '目標設定中'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : item.status === '評価申請中'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : item.status === 'フィードバック'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                            : item.status === '一次評価'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                              : item.status === '二次評価'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                : item.status === '最終評価'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.plan}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.department}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.period}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 評価結果 */}
      <Card className="mb-4">
        <Text className="font-bold text-base mb-3">評価結果</Text>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tremor-border dark:border-dark-tremor-border">
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  年度
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  評価計画
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  評価点
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  等級
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  所属
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  1次評価
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  2次評価
                </th>
                <th className="px-3 py-2 text-left text-sm font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  最終評価
                </th>
              </tr>
            </thead>
            <tbody>
              {evaluationResults.map((item, index) => (
                <tr key={index} className="border-b border-tremor-border dark:border-dark-tremor-border">
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.year}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.plan}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.score}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.grade === 'G2'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : item.grade === 'G1'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300'
                          : item.grade === 'S2'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }`}
                    >
                      {item.grade}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.department}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.firstEvaluator}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.secondEvaluator}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm text-tremor-content dark:text-dark-tremor-content">{item.finalEvaluator}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 評価推移グラフ */}
      <Card>
        <Text className="font-bold text-base mb-3">評価推移</Text>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                {Object.entries(rankColors).map(([rank, color]) => (
                  <linearGradient key={rank} id={`color${rank}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-tremor-border-subtle dark:stroke-dark-tremor-border-subtle"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                className="text-tremor-content dark:text-dark-tremor-content"
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                domain={[0, 100]}
                className="text-tremor-content dark:text-dark-tremor-content"
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tremor-background)',
                  borderColor: 'var(--tremor-border)',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                itemStyle={{ color: 'var(--tremor-content)' }}
                labelStyle={{ color: 'var(--tremor-content-emphasis)', marginBottom: '4px' }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px'
                }}
              />
              {/* 推奨ボーダーライン */}
              <ReferenceLine
                y={borderValue}
                stroke="#666666"
                strokeDasharray="5 5"
                label={{ value: '推奨ボーダー', position: 'right' }}
              />
              {/* 等級ごとの評価点ライン */}
              {Object.entries(rankColors).map(([rank, color]) => (
                <Line
                  key={rank}
                  type="monotone"
                  dataKey={rank}
                  name={rank}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ r: 4, fill: color, strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: color, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}