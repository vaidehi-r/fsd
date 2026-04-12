import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';

const StatsCard = ({ icon: Icon, label, value, trend, trendValue, color = 'primary' }) => {
  const colorMap = {
    primary: 'from-primary-500 to-primary-700',
    green: 'from-green-500 to-green-700',
    amber: 'from-amber-500 to-amber-700',
    purple: 'from-purple-500 to-purple-700',
    red: 'from-red-500 to-red-700',
    blue: 'from-blue-500 to-blue-700',
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <HiTrendingUp /> : <HiTrendingDown />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="text-white text-xl" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
