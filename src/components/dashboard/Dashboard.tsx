
import { Package2, TrendingUp, Users, AlertCircle } from 'lucide-react';
import StatsCard from './StatsCard';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome to your inventory dashboard</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value="2,420"
          icon={<Package2 className="h-6 w-6" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Total Sales"
          value="$45,250"
          icon={<TrendingUp className="h-6 w-6" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Active Customers"
          value="1,210"
          icon={<Users className="h-6 w-6" />}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Low Stock Items"
          value="13"
          icon={<AlertCircle className="h-6 w-6" />}
          trend={{ value: 2, isPositive: false }}
        />
      </div>
    </div>
  );
};

export default Dashboard;
