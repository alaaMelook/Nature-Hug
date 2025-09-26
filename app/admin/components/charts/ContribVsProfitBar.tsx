"use client";

import { BarChart, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

export default function ContribVsProfitBar({ data }: { data: any[] }) {
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="totalContributions" fill="#0088FE" name="Contributions" />
      <Bar dataKey="totalProfitShare" fill="#00C49F" name="Profits" />
    </BarChart>
  );
}
