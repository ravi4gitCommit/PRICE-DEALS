"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { getPriceHistory } from "@/app/auth/callback/actions";

const FILTERS = [
  { label: "1M", value: "1m", days: 30 },
  { label: "6M", value: "6m", days: 180 },
  { label: "1Y", value: "1y", days: 365 },
  { label: "All", value: "all", days: null },
];

export default function PriceChart({ productId, currency = "USD" }) {
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

    if (productId) {
      loadHistory();
    }
  }, [productId]);

  // Filter history based on selected period
  const filteredData = useMemo(() => {
    if (!history.length) return [];

    const sorted = [...history].sort(
      (a, b) =>
        new Date(a.checked_at || a.created_at) -
        new Date(b.checked_at || b.created_at)
    );

    const selectedFilter = FILTERS.find(
      (item) => item.value === filter
    );

    if (!selectedFilter || selectedFilter.days === null) {
      return sorted;
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - selectedFilter.days);

    return sorted.filter((item) => {
      const date = new Date(item.checked_at || item.created_at);
      return date >= cutoff;
    });
  }, [history, filter]);

  // Convert data for chart
  const chartData = useMemo(() => {
    return filteredData
      .map((item) => {
        const date = new Date(
          item.checked_at || item.created_at
        );

        return {
          date: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
          }),

          fullDate: date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),

          price: Number(item.price),
        };
      })
      .filter((item) => !Number.isNaN(item.price));
  }, [filteredData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData.length) {
      return {
        current: 0,
        lowest: 0,
        highest: 0,
        average: 0,
        dropPercentage: 0,
      };
    }

    const prices = chartData.map((item) => item.price);

    const current = prices[prices.length - 1];
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);

    const average =
      prices.reduce((sum, price) => sum + price, 0) /
      prices.length;

    const firstPrice = prices[0];

    const dropPercentage =
      firstPrice > current
        ? ((firstPrice - current) / firstPrice) * 100
        : 0;

    return {
      current,
      lowest,
      highest,
      average,
      dropPercentage,
    };
  }, [chartData]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[260px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          <p className="text-sm">Loading price history...</p>
        </div>
      </div>
    );
  }

  // No history
  if (!history.length) {
    return (
      <div className="flex min-h-[260px] w-full flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
          <TrendingDown className="h-7 w-7 text-orange-500" />
        </div>

        <h4 className="text-base font-semibold text-gray-900">
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
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 sm:p-5">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-gray-900">
            Price History
          </h4>

          <p className="text-xs text-gray-500">
            Track price changes over time
          </p>
        </div>

        {/* Filters */}
        <div className="flex w-fit rounded-lg border border-gray-200 bg-gray-50 p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                filter === item.value
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:bg-white hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Current
          </p>

          <p className="mt-1 text-base font-bold text-gray-900 sm:text-lg">
            {currency} {formatPrice(stats.current)}
          </p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Lowest
          </p>

          <p className="mt-1 text-base font-bold text-green-600 sm:text-lg">
            {currency} {formatPrice(stats.lowest)}
          </p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Highest
          </p>

          <p className="mt-1 text-base font-bold text-red-500 sm:text-lg">
            {currency} {formatPrice(stats.highest)}
          </p>
        </div>

        <div className="rounded-lg border bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Price Drop
          </p>

          <div className="mt-1 flex items-center gap-1">
            {stats.dropPercentage > 0 ? (
              <TrendingDown className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingUp className="h-4 w-4 text-gray-400" />
            )}

            <span
              className={`text-base font-bold sm:text-lg ${
                stats.dropPercentage > 0
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >
              {stats.dropPercentage > 0
                ? `${stats.dropPercentage.toFixed(1)}%`
                : "No drop"}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fontSize: 11,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: "#6b7280",
                }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) =>
                  `${currency} ${formatPrice(value)}`
                }
              />

              <Tooltip
                cursor={{
                  stroke: "#fdba74",
                  strokeWidth: 1,
                }}
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  boxShadow:
                    "0 4px 12px rgba(0,0,0,0.08)",
                }}
                labelStyle={{
                  color: "#111827",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                formatter={(value) => [
                  `${currency} ${formatPrice(value)}`,
                  "Price",
                ]}
                labelFormatter={(label, payload) => {
                  return (
                    payload?.[0]?.payload?.fullDate ||
                    label
                  );
                }}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#f97316"
                strokeWidth={3}
                dot={{
                  r: 3,
                  fill: "#f97316",
                  strokeWidth: 0,
                }}
                activeDot={{
                  r: 6,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed bg-gray-50 text-center">
          <div>
            <p className="font-medium text-gray-700">
              No data for this period
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Try a longer time range.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <p className="text-xs text-gray-500">
          {chartData.length}{" "}
          {chartData.length === 1 ? "record" : "records"}
        </p>

        <p className="text-xs text-gray-400">
          Auto updated
        </p>
      </div>
    </div>
  );
}