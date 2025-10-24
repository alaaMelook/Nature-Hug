'use client'
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, TrendingUpDown } from "lucide-react";
import { useAdminDashboard, useRecentOrders } from "../../ui/hooks/admin/useAdminDashboard";
import { OrderDetailsView } from "@/domain/entities/views/admin/orderDetailsView";


export default function AdminDashboard() {
  const { data: stats, isPending } = useAdminDashboard();
  const { data: recentOrders } = useRecentOrders();

  console.log('Stats:', stats);
  const statCards = [
    {
      title: "Total Customers",
      value: stats?.total_customers ?? 0,
      icon: Users,
      change: stats?.customers_change,
      changeType: stats?.customers_change_status,
    },
    {
      title: "Total Products",
      value: stats?.total_products ?? 0,
      icon: Package,
      change: stats?.products_change,
      changeType: stats?.products_change_status,
    },
    {
      title: "Total Orders",
      value: stats?.total_orders,
      icon: ShoppingCart,
      change: stats?.orders_change,
      changeType: stats?.orders_change_status,
    },
    {
      title: "Total Revenue",
      value: stats?.total_revenue.toLocaleString(),
      icon: DollarSign,
      change: stats?.revenue_change,
      changeType: stats?.revenue_change_status,
    },
  ];

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-full">
                <stat.icon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === "positive" ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : stat.changeType === "negative" ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : <TrendingUpDown className="h-4 w-4  text-gray-600 mr-1" ></TrendingUpDown>}
              <span className={`text-sm font-medium ${stat.changeType === "positive" ? "text-green-600" : stat.changeType === "negative" ? "text-red-600" : "text-gray-600"
                }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders?.map((order: OrderDetailsView) => (
                <tr key={order.order_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{order.customer_name || "N/A"}</div>
                      <div className="text-gray-500">{order.customer_email || "N/A"}</div>
                      {order.customer_phone.map((phone) => (
                        <div key={phone} className="text-gray-500">{phone}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.order_status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.order_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.final_order_total?.toLocaleString() || "0"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}