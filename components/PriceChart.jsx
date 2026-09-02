"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingDown } from "lucide-react";
import { getPriceHistory } from "@/app/auth/callback/actions";

const FILTERS = [
  { label: "1 Month", value: "1m", days: 30 },
  { label: "3 Month", value: "3m", days: 90 },
  { label: "Max", value: "all", days: null },
];

export default function PriceChart({ productId, currency = "INR" }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("1m");

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);

        const data = await getPriceHistory(productId);

        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Price history error:", error);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [productId]);

  const chartData = useMemo(() => {
    if (!history.length) return [];

    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.checked_at || a.created_at) -
        new Date(b.checked_at || b.created_at)
    );

    const selected = FILTERS.find((item) => item.value === filter);

    if (!selected || selected.days === null) {
      return sorted.map(formatChartData);
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selected.days);

    return sorted
      .filter((item) => {
        const date = new Date(item.checked_at || item.created_at);
        return date >= cutoff;
      })
      .map(formatChartData);
  }, [history, filter]);

  function formatChartData(item) {
    const date = new Date(item.checked_at || item.created_at);

    return {
      price: Number(item.price),
      date: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      fullDate: date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  }

  const stats = useMemo(() => {
    if (!chartData.length) return null;

    const prices = chartData.map((item) => item.price);

    const current = prices[prices.length - 1];
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);

    const drop =
      prices[0] > current
        ? ((prices[0] - current) / prices[0]) * 100
        : 0;

    return {
      current,
      lowest,
      highest,
      drop,
    };
  }, [chartData]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <span className="text-sm">Loading price history...</span>
        </div>
      </div>
    );
  }

  if (!history.length) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
          <TrendingDown className="h-7 w-7 text-orange-500" />
        </div>

        <h4 className="font-semibold text-gray-900">
          No price history yet
        </h4>

        <p className="mt-1 max-w-sm text-sm text-gray-500">
          Price changes will appear here after the product
          price is checked again.
        </p>
      </div>
    );
  }

  return (
     <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Price History
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Track how the product price changes over time
          </p>
        </div>

        {/* Filters */}
        <div className="flex w-fit rounded-full bg-gray-100 p-1">

          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                filter === item.value
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}

        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs text-gray-500">Current</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              {currency} {formatPrice(stats.current)}
            </p>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs text-gray-500">Lowest</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {currency} {formatPrice(stats.lowest)}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs text-gray-500">Highest</p>
            <p className="mt-1 text-lg font-bold text-red-500">
              {currency} {formatPrice(stats.highest)}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-4">
            <p className="text-xs text-gray-500">Price Drop</p>
            <p className="mt-1 text-lg font-bold text-green-600">
              {stats.drop > 0
                ? `↓ ${stats.drop.toFixed(1)}%`
                : "—"}
            </p>
          </div>

        </div>
      )}

      {/* Graph */}
      {chartData.length > 0 ? (
        <div className="h-[300px] w-full">

          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >

              {/* Gradient */}
              <defs>
                <linearGradient
                  id={`priceGradient-${productId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#ff7a00"
                    stopOpacity={0.30}
                  />

                  <stop
                    offset="100%"
                    stopColor="#ff7a00"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              {/* Grid */}
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                vertical={false}
              />

              {/* X Axis */}
              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />

              {/* Y Axis */}
              <YAxis
                tick={{
                  fontSize: 12,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={false}
                width={65}
                tickFormatter={(value) =>
                  `${currency} ${formatPrice(value)}`
                }
              />

              {/* Tooltip */}
              <Tooltip
                cursor={{
                  stroke: "#ff7a00",
                  strokeDasharray: "4 4",
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.10)",
                }}
                labelStyle={{
                  color: "#111827",
                  fontWeight: 600,
                  marginBottom: "5px",
                }}
                formatter={(value) => [
                  `${currency} ${formatPrice(value)}`,
                  "Price",
                ]}
                labelFormatter={(label, payload) =>
                  payload?.[0]?.payload?.fullDate || label
                }
              />

              {/* Area + Line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke="#ff6b00"
                strokeWidth={2}
                fill={`url(#priceGradient-${productId})`}
                dot={{
                  r: 2,
                  fill: "#ff6b00",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  fill: "#ff6b00",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />

            </AreaChart>
          </ResponsiveContainer>

        </div>
      ) : (
        <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed">
          <div className="text-center">
            <p className="font-medium text-gray-700">
              No data for this period
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try selecting a longer time range.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between border-t pt-4">

        <p className="text-xs text-gray-500">
          {chartData.length} price{" "}
          {chartData.length === 1 ? "record" : "records"}
        </p>

        <p className="text-xs text-gray-400">
          Price tracked automatically
        </p>

      </div>

    </div>
  );
}