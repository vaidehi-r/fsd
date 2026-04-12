import { Link } from 'react-router-dom';
import { HiChevronRight, HiHome } from 'react-icons/hi';

const PageHeader = ({ title, breadcrumbs = [], actions }) => {
  return (
    <div className="mb-8">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
          <Link to="/" className="hover:text-primary-700 transition-colors">
            <HiHome className="text-lg" />
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <HiChevronRight className="text-slate-300" />
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-primary-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">{title}</h1>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
